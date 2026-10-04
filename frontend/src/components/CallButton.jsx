import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall, inline = false }) {
  if (inline) {
    return (
      <button
        onClick={handleVideoCall}
        className="btn btn-success btn-sm text-white gap-2"
        title="Start a video call"
        aria-label="Start a video call"
      >
        <VideoIcon className="size-4" />
        <span>Video Call</span>
      </button>
    );
  }

  return (
    <div className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0 z-10 pointer-events-none">
      <button
        onClick={handleVideoCall}
        className="btn btn-success btn-sm text-white pointer-events-auto gap-2"
        title="Start a video call"
        aria-label="Start a video call"
      >
        <VideoIcon className="size-5" />
        <span className="hidden sm:inline">Video Call</span>
      </button>
    </div>
  );
}

export default CallButton;
