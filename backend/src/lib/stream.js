import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.warn("Stream Chat credentials are not configured. Chat/video token generation will fail until they are set.");
}

const streamClient = StreamChat.getInstance(apiKey || "missing-key", apiSecret || "missing-secret");

export const upsertStreamUser = async (userData) => {
  if (!apiKey || !apiSecret) {
    throw new Error("STREAM_API_KEY and STREAM_API_SECRET are required");
  }

  await streamClient.upsertUsers([userData]);
  return userData;
};

export const generateStreamToken = (userId) => {
  if (!apiKey || !apiSecret) {
    throw new Error("STREAM_API_KEY and STREAM_API_SECRET are required");
  }

  return streamClient.createToken(String(userId));
};
