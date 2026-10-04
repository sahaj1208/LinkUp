import { Link, useLocation } from "react-router";
import { BellIcon, LogOutIcon, MessageCircleIcon, ShipWheelIcon } from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import ThemeSelector from "./ThemeSelector";
import ProfileAvatar from "./ProfileAvatar";
import useNotificationBadge from "../hooks/useNotificationBadge";
import { useChatNotifications } from "../context/ChatNotificationsProvider";

const NotificationBadge = ({ count }) => {
  if (!count) return null;

  return (
    <span className="absolute -right-0.5 -top-0.5 min-w-4 h-4 px-1 rounded-full bg-error text-error-content text-[10px] leading-4 text-center font-bold ring-2 ring-base-200">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { logoutMutation } = useLogout();
  const { count: notificationCount } = useNotificationBadge();
  const { unreadTotal: messageCount } = useChatNotifications();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 min-h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full gap-3 sm:gap-4">
          {isChatPage && (
            <div className="mr-auto pl-1 sm:pl-5">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-8 text-primary" />
                <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  LinkUp
                </span>
              </Link>
            </div>
          )}

          <Link
            to="/friends"
            className="btn btn-ghost btn-circle relative"
            title="Messages"
            aria-label="Messages"
          >
            <MessageCircleIcon className="h-6 w-6 text-base-content opacity-70" />
            <NotificationBadge count={messageCount} />
          </Link>

          <Link
            to="/notifications"
            className="btn btn-ghost btn-circle relative"
            aria-label="Notifications"
          >
            <BellIcon className="h-6 w-6 text-base-content opacity-70" />
            <NotificationBadge count={notificationCount} />
          </Link>

          <ThemeSelector />

          <Link to="/profile" className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Open profile settings" title="Profile settings">
            <ProfileAvatar
              name={authUser?.fullName}
              src={authUser?.profilePic}
              size="size-9"
              textSize="text-xs"
            />
          </Link>

          <button className="btn btn-ghost btn-circle" onClick={logoutMutation} aria-label="Logout">
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
