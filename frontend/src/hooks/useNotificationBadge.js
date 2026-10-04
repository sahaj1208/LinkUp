import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const STORAGE_KEY = "linkup.notifications.lastSeenAt";
const READ_EVENT = "linkup:notifications-read";

const getTimestamp = (value) => {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const markNotificationsRead = () => {
  const now = String(Date.now());
  localStorage.setItem(STORAGE_KEY, now);
  window.dispatchEvent(new Event(READ_EVENT));
};

const useNotificationBadge = () => {
  const [lastSeenAt, setLastSeenAt] = useState(() => localStorage.getItem(STORAGE_KEY) || "");

  const query = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const handleRead = () => setLastSeenAt(localStorage.getItem(STORAGE_KEY) || "");
    window.addEventListener(READ_EVENT, handleRead);
    return () => window.removeEventListener(READ_EVENT, handleRead);
  }, []);

  useEffect(() => {
    if (!query.isSuccess || lastSeenAt) return;
    const now = String(Date.now());
    localStorage.setItem(STORAGE_KEY, now);
    setLastSeenAt(now);
  }, [query.isSuccess, lastSeenAt]);

  const count = useMemo(() => {
    const cutoff = Number(lastSeenAt || 0);
    const incoming = query.data?.incomingReqs || [];
    const accepted = query.data?.acceptedReqs || [];

    const unreadIncoming = incoming.filter(
      (request) => getTimestamp(request.createdAt) > cutoff
    ).length;

    const unreadAccepted = accepted.filter(
      (request) => getTimestamp(request.updatedAt || request.createdAt) > cutoff
    ).length;

    return unreadIncoming + unreadAccepted;
  }, [lastSeenAt, query.data]);

  return {
    ...query,
    count,
    markAsRead: markNotificationsRead,
  };
};

export default useNotificationBadge;
