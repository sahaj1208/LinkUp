import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useChatNotifications } from "../context/ChatNotificationsProvider";
import useAuthUser from "../hooks/useAuthUser";
import { Channel, ChannelHeader, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import ChatToolbar from "../components/ChatToolbar";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const { authUser } = useAuthUser();
  const { chatClient, markConversationRead, isReady, error: chatError } = useChatNotifications();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const openChannel = async () => {
      if (!authUser || !targetUserId || !isReady || !chatClient) return;

      try {
        setLoading(true);
        setError("");

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currentChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currentChannel.watch();
        await currentChannel.markRead();
        await markConversationRead(targetUserId);

        if (cancelled) return;
        setChannel(currentChannel);
      } catch (chatError) {
        console.error("Error opening chat:", chatError);
        if (!cancelled) {
          setError("Could not connect to chat. Please try again.");
          toast.error("Could not connect to chat. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    openChannel();

    return () => {
      cancelled = true;
    };
  }, [authUser, targetUserId, chatClient, isReady, markConversationRead]);

  const handleVideoCall = async () => {
    if (!channel) return;

    const callId = `call-${channel.id}-${Date.now()}`;
    const callUrl = `${window.location.origin}/call/${encodeURIComponent(callId)}`;

    try {
      await channel.sendMessage({
        text: `Video call started. Join here: ${callUrl}`,
      });
      toast.success("Video call link sent");
    } catch (sendError) {
      console.error("Could not send call link:", sendError);
      toast.error("Could not send the video call link.");
    }
  };

  if (!authUser || loading || !isReady) return <ChatLoader />;

  if (error || chatError || !chatClient || !channel) {
    return (
      <div className="h-[93vh] flex items-center justify-center p-6">
        <div className="alert alert-error max-w-lg">
          <span>{error || chatError || "Unable to initialize chat."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[93vh] bg-base-100">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full h-full flex flex-col">
            <ChatToolbar onVideoCall={handleVideoCall} />
            <div className="flex-1 min-h-0">
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput focus />
              </Window>
            </div>
            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
