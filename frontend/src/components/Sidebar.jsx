import { Link, useLocation } from "react-router";
import { BellIcon, HomeIcon, MessageCircleIcon, ShipWheelIcon, UserCircleIcon, UsersIcon } from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import ProfileAvatar from "./ProfileAvatar";
import useNotificationBadge from "../hooks/useNotificationBadge";
import { useChatNotifications } from "../context/ChatNotificationsProvider";

const NotificationBadge = ({ count }) => {
  if (!count) return null;

  return (
    <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-error text-error-content text-[10px] leading-5 text-center font-bold">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const { count: notificationCount } = useNotificationBadge();
  const { unreadTotal: messageCount } = useChatNotifications();

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            LinkUp
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath.startsWith("/chat/") ? "btn-active" : ""
          }`}
        >
          <MessageCircleIcon className="size-5 text-base-content opacity-70" />
          <span>Messages</span>
          <NotificationBadge count={messageCount} />
        </Link>

        <Link
          to="/profile"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/profile" ? "btn-active" : ""
          }`}
        >
          <UserCircleIcon className="size-5 text-base-content opacity-70" />
          <span>My Profile</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
          <NotificationBadge count={notificationCount} />
        </Link>
      </nav>

      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            name={authUser?.fullName}
            src={authUser?.profilePic}
            size="size-10"
            textSize="text-xs"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{authUser?.fullName}</p>
            <p className="text-xs opacity-60">Ready to connect</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
