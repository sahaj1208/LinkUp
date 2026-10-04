import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

const sanitizeUser = (user) => {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  return safeUser;
};

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

const setAuthCookie = (res, token) => {
  res.cookie("jwt", token, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export async function signup(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const fullName = req.body.fullName?.trim();

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    if (fullName.length < 2 || fullName.length > 80) {
      return res.status(400).json({ message: "Full name must be between 2 and 80 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
      isOnline: true,
      lastSeen: new Date(),
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic,
      });
    } catch (streamError) {
      console.error("Stream user sync failed during signup:", streamError.message);
    }

    setAuthCookie(res, createToken(newUser._id));
    return res.status(201).json({ success: true, user: sanitizeUser(newUser) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    console.error("Error in signup controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    setAuthCookie(res, createToken(user._id));
    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Error in login controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function logout(req, res) {
  try {
    const token = req.cookies?.jwt;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        await User.findByIdAndUpdate(decoded.userId, {
          $set: { isOnline: false, lastSeen: new Date() },
        });
      } catch (tokenError) {
        // The cookie can still be cleared even if the JWT is already expired/invalid.
      }
    }
  } catch (error) {
    console.error("Could not update offline presence during logout:", error);
  }

  res.clearCookie("jwt", COOKIE_OPTIONS);
  return res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic } = req.body;

    const values = {
      fullName: fullName?.trim(),
      bio: bio?.trim(),
      nativeLanguage: nativeLanguage?.trim().toLowerCase(),
      learningLanguage: learningLanguage?.trim().toLowerCase(),
      location: location?.trim(),
      profilePic: profilePic?.trim(),
    };

    const missingFields = [
      !values.fullName && "fullName",
      !values.nativeLanguage && "nativeLanguage",
      !values.learningLanguage && "learningLanguage",
    ].filter(Boolean);

    if (missingFields.length) {
      return res.status(400).json({
        message: "Please complete all required profile fields",
        missingFields,
      });
    }

    if (values.nativeLanguage === values.learningLanguage) {
      return res.status(400).json({
        message: "Native language and learning language should be different",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...values, isOnboarded: true },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
    } catch (streamError) {
      console.error("Stream user sync failed during onboarding:", streamError.message);
    }

    return res.status(200).json({ success: true, user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error("Onboarding error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
