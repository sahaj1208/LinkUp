import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "../lib/api";
import {
  BellIcon,
  ClockIcon,
  MessageSquareIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import NoNotificationsFound from "../components/NoNotificationsFound";
import ProfileAvatar from "../components/ProfileAvatar";
import useNotificationBadge, { markNotificationsRead } from "../hooks/useNotificationBadge";
import { getErrorMessage } from "../lib/utils";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: friendRequests, isLoading } = useNotificationBadge();

  useEffect(() => {
    if (!isLoading) markNotificationsRead();
  }, [isLoading]);

  const { mutate: acceptRequestMutation, isPending: isAccepting } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Friend request accepted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not accept the request.")),
  });

  const { mutate: rejectRequestMutation, isPending: isRejecting } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Friend request rejected");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not reject the request.")),
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <BellIcon className="size-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
          </div>
          <p className="mt-1 text-sm opacity-70">
            Friend requests and recent connection updates appear here.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">{incomingRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 border border-base-300/70 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <ProfileAvatar
                              name={request.sender.fullName}
                              src={request.sender.profilePic}
                              size="size-14"
                              textSize="text-base"
                            />
                            <div className="min-w-0">
                              <h3 className="font-semibold truncate">{request.sender.fullName}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-sm">
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline badge-sm">
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 sm:justify-end">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => rejectRequestMutation(request._id)}
                              disabled={isAccepting || isRejecting}
                              title="Reject request"
                            >
                              <UserXIcon className="size-4" />
                              Reject
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => acceptRequestMutation(request._id)}
                              disabled={isAccepting || isRejecting}
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => (
                    <div key={notification._id} className="card bg-base-200 border border-base-300/70 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <ProfileAvatar
                            name={notification.recipient.fullName}
                            src={notification.recipient.profilePic}
                            size="size-10"
                            textSize="text-xs"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{notification.recipient.fullName}</h3>
                            <p className="text-sm my-1">
                              {notification.recipient.fullName} accepted your friend request.
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Recently
                            </p>
                          </div>
                          <div className="badge badge-success hidden sm:flex gap-1">
                            <MessageSquareIcon className="h-3 w-3" />
                            New Friend
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
