import { useEffect } from "react";
import useAuthUser from "./useAuthUser";
import { updatePresence } from "../lib/api";

const HEARTBEAT_MS = 20 * 1000;

const usePresenceHeartbeat = () => {
  const { authUser } = useAuthUser();

  useEffect(() => {
    if (!authUser?._id) return undefined;

    let cancelled = false;

    const sendHeartbeat = async () => {
      try {
        if (!cancelled) {
          await updatePresence(true);
        }
      } catch (error) {
        // Presence should never block the application if the heartbeat fails.
        console.debug("Presence heartbeat failed", error);
      }
    };

    sendHeartbeat();
    const intervalId = window.setInterval(sendHeartbeat, HEARTBEAT_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [authUser?._id]);
};

export default usePresenceHeartbeat;
