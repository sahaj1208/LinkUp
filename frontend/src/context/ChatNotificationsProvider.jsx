import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";

import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
const ChatNotificationsContext = createContext(null);

const getDirectChannelId = (userA, userB) => [userA, userB].sort().join("-");

const getUnreadCount = (channel, userId) =>
  channel?.state?.read?.[userId]?.unread_messages || 0;

const getOtherMemberId = (channel, currentUserId) => {
  const members = channel?.state?.members || {};
  return Object.keys(members).find((memberId) => memberId !== currentUserId) || null;
};

export const ChatNotificationsProvider = ({ children }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPathRef = useRef(location.pathname);
  const clientRef = useRef(null);
  const [chatClient, setChatClient] = useState(null);
  const [unreadByUserId, setUnreadByUserId] = useState({});
  const [error, setError] = useState("");

  const { data: tokenData, isLoading: isTokenLoading, isError: isTokenError } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    currentPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribeMessage = null;

    const connect = async () => {
      if (!authUser || isTokenLoading) return;

      if (isTokenError || !tokenData?.token || !STREAM_API_KEY) {
        setError("Unable to initialize real-time messaging.");
        return;
      }

      try {
        setError("");

        const client = StreamChat.getInstance(STREAM_API_KEY);
        clientRef.current = client;

        if (client.userID && client.userID !== authUser._id) {
          await client.disconnectUser();
        }

        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic || undefined,
            },
            tokenData.token
          );
        }

        if (cancelled) return;

        setChatClient(client);

        const channels = await client.queryChannels(
          {
            type: "messaging",
            members: { $in: [authUser._id] },
          },
          [{ last_message_at: -1 }],
          { limit: 100, watch: false, state: true, presence: false }
        );

        if (cancelled) return;

        const nextUnread = {};
        channels.forEach((channel) => {
          const otherMemberId = getOtherMemberId(channel, authUser._id);
          const unreadCount = getUnreadCount(channel, authUser._id);

          if (otherMemberId && unreadCount > 0) {
            nextUnread[otherMemberId] = unreadCount;
          }
        });

        setUnreadByUserId(nextUnread);

        const handleMessageNotification = (event) => {
          if (!event?.user?.id || event.user.id === authUser._id) return;

          const currentChatUserId = currentPathRef.current.startsWith("/chat/")
            ? decodeURIComponent(currentPathRef.current.split("/chat/")[1] || "")
            : null;

          if (currentChatUserId === event.user.id) {
            const channelId = event.channel_id
              ? `messaging:${event.channel_id}`
              : null;

            if (channelId) {
              client.channel("messaging", event.channel_id).markRead().catch(() => {});
            }
            return;
          }

          setUnreadByUserId((current) => ({
            ...current,
            [event.user.id]: (current[event.user.id] || 0) + 1,
          }));
        };

        const subscription = client.on("notification.message_new", handleMessageNotification);
        unsubscribeMessage = () => subscription?.unsubscribe?.();
      } catch (streamError) {
        console.error("Error initializing global Stream client:", streamError);
        if (!cancelled) setError("Unable to initialize real-time messaging.");
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (unsubscribeMessage) unsubscribeMessage();
      unsubscribeMessage = null;
    };
  }, [authUser, tokenData?.token, isTokenLoading, isTokenError]);

  useEffect(() => {
    return () => {
      if (clientRef.current?.userID) {
        clientRef.current.disconnectUser().catch(() => {});
      }
      clientRef.current = null;
      setChatClient(null);
    };
  }, []);

  const markConversationRead = useCallback(async (otherUserId) => {
    setUnreadByUserId((current) => {
      if (!current[otherUserId]) return current;
      const next = { ...current };
      delete next[otherUserId];
      return next;
    });

    if (!clientRef.current || !authUser?._id || !otherUserId) return;

    try {
      const channelId = getDirectChannelId(authUser._id, otherUserId);
      const channel = clientRef.current.channel("messaging", channelId, {
        members: [authUser._id, otherUserId],
      });
      await channel.watch();
      await channel.markRead();
    } catch (readError) {
      console.error("Could not mark conversation as read:", readError);
    }
  }, [authUser?._id]);

  const unreadTotal = Object.values(unreadByUserId).reduce((sum, count) => sum + count, 0);

  const value = useMemo(
    () => ({
      chatClient,
      unreadByUserId,
      unreadTotal,
      getUnreadCountForUser: (userId) => unreadByUserId[userId] || 0,
      markConversationRead,
      error,
      isReady: Boolean(chatClient),
    }),
    [chatClient, unreadByUserId, unreadTotal, error, markConversationRead]
  );

  return (
    <ChatNotificationsContext.Provider value={value}>
      {children}
    </ChatNotificationsContext.Provider>
  );
};

export const useChatNotifications = () => {
  const context = useContext(ChatNotificationsContext);

  if (!context) {
    throw new Error("useChatNotifications must be used inside ChatNotificationsProvider");
  }

  return context;
};
