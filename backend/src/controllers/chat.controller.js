import { generateStreamToken } from "../lib/stream.js";

export function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user._id);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error in getStreamToken controller:", error);
    return res.status(500).json({ message: "Unable to create chat token" });
  }
}
