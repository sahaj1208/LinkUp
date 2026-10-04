import mongoose from "mongoose";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

const PRESENCE_TIMEOUT_MS = 60 * 1000;

const applyPresence = (user) => {
  const data = user.toObject ? user.toObject() : { ...user };
  const lastSeen = data.lastSeen ? new Date(data.lastSeen).getTime() : 0;
  data.isOnline = Boolean(data.isOnline && lastSeen && Date.now() - lastSeen < PRESENCE_TIMEOUT_MS);
  return data;
};

export async function getRecommendedUsers(req, res) {
  try {
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      _id: { $ne: currentUser._id, $nin: currentUser.friends },
      isOnboarded: true,
    })
      .select("fullName profilePic bio nativeLanguage learningLanguage location isOnline lastSeen")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json(recommendedUsers.map(applyPresence));
  } catch (error) {
    console.error("Error in getRecommendedUsers controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate("friends", "fullName profilePic bio nativeLanguage learningLanguage location isOnline lastSeen");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user.friends.map(applyPresence));
  } catch (error) {
    console.error("Error in getMyFriends controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user._id.toString();
    const recipientId = req.params.id;

    if (!mongoose.isValidObjectId(recipientId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send a friend request to yourself" });
    }

    const recipient = await User.findById(recipientId).select("friends");
    if (!recipient) return res.status(404).json({ message: "Recipient not found" });

    if (recipient.friends.some((id) => id.toString() === myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId, status: "pending" },
        { sender: recipientId, recipient: myId, status: "pending" },
      ],
    });

    if (existingRequest) {
      return res.status(409).json({ message: "A pending friend request already exists between you" });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    return res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid friend request id" });
    }

    const friendRequest = await FriendRequest.findById(req.params.id);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: "This friend request is no longer pending" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function rejectFriendRequest(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid friend request id" });
    }

    const friendRequest = await FriendRequest.findById(req.params.id);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to reject this request" });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: "This friend request is no longer pending" });
    }

    friendRequest.status = "rejected";
    await friendRequest.save();

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in rejectFriendRequest controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    })
      .populate("sender", "fullName profilePic nativeLanguage learningLanguage")
      .sort({ createdAt: -1 });

    const acceptedReqs = await FriendRequest.find({
      sender: req.user._id,
      status: "accepted",
    })
      .populate("recipient", "fullName profilePic")
      .sort({ updatedAt: -1 })
      .limit(20);

    return res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.error("Error in getFriendRequests controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    })
      .populate("recipient", "fullName profilePic nativeLanguage learningLanguage")
      .sort({ createdAt: -1 });

    return res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendReqs controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function updatePresence(req, res) {
  try {
    const online = req.body?.online !== false;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          isOnline: online,
          lastSeen: new Date(),
        },
      },
      { new: true }
    ).select("_id isOnline lastSeen");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      isOnline: Boolean(updatedUser.isOnline),
      lastSeen: updatedUser.lastSeen,
    });
  } catch (error) {
    console.error("Error in updatePresence controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
