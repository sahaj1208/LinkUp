import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router";
import CallButton from "./CallButton";

const ChatToolbar = ({ onVideoCall }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between border-b border-base-300 bg-base-100 px-3 py-2.5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm gap-2"
        aria-label="Go back"
      >
        <ArrowLeftIcon className="size-4" />
        <span className="hidden sm:inline">Back</span>
      </button>

      <CallButton handleVideoCall={onVideoCall} inline />
    </div>
  );
};

export default ChatToolbar;
