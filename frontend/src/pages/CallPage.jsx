import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState("");

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData, isLoading: isTokenLoading, isError: isTokenError } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    let cancelled = false;
    let videoClient = null;
    let callInstance = null;

    const initCall = async () => {
      if (isTokenLoading || !authUser) return;

      if (isTokenError || !tokenData?.token) {
        setError("Unable to authenticate the video call.");
        setIsConnecting(false);
        return;
      }

      if (!callId || !STREAM_API_KEY) {
        setError("Video call configuration is incomplete.");
        setIsConnecting(false);
        return;
      }

      try {
        setIsConnecting(true);
        setError("");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });

        if (cancelled) return;

        setClient(videoClient);
        setCall(callInstance);
      } catch (callError) {
        console.error("Error joining call:", callError);
        setError("Could not join the call. Please try again.");
        toast.error("Could not join the call. Please try again.");
      } finally {
        if (!cancelled) setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      cancelled = true;
      callInstance?.leave().catch(() => {});
      if (typeof videoClient?.disconnectUser === "function") {
        videoClient.disconnectUser().catch(() => {});
      }
    };
  }, [tokenData?.token, authUser, callId, isTokenLoading, isTokenError]);

  if (isLoading || isConnecting) return <PageLoader />;

  if (error || !client || !call) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <div className="alert alert-error max-w-lg">
          <span>{error || "Could not initialize the call."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <CallContent />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
