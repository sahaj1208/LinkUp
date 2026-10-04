import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { MessageCircleIcon, VideoIcon } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import { useChatNotifications } from "../context/ChatNotificationsProvider";

const getLastSeenLabel = (lastSeen) => {
  if (!lastSeen) return "Offline";

  const diffMs = Math.max(0, Date.now() - new Date(lastSeen).getTime());
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Last seen just now";
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `Last seen ${diffDays}d ago`;
};

const FriendCard = ({ friend }) => {
  const { getUnreadCountForUser } = useChatNotifications();
  const unreadCount = getUnreadCountForUser(friend._id);

  return (
    <div className="card bg-base-200 hover:shadow-md transition-all duration-200 border border-base-300/70">
      <div className="card-body p-4">
        <div className="flex items-center gap-3 mb-3">
          <ProfileAvatar
            name={friend.fullName}
            src={friend.profilePic}
            size="size-12"
            textSize="text-sm"
          />
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{friend.fullName}</h3>
            <p className="text-xs opacity-60">Language partner</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <Link
            to={`/chat/${friend._id}`}
            className="btn btn-outline col-span-4 relative"
            aria-label={`Message ${friend.fullName}`}
          >
            <MessageCircleIcon className="size-4" />
            Message
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 min-w-5 h-5 px-1 rounded-full bg-error text-error-content text-[10px] leading-5 text-center font-bold ring-2 ring-base-200">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            to={`/chat/${friend._id}`}
            className="btn btn-primary col-span-1 px-0"
            title="Open chat to start a video call"
            aria-label={`Video call with ${friend.fullName}`}
          >
            <VideoIcon className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt=""
        aria-hidden="true"
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
