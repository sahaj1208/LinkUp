import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, UsersIcon } from "lucide-react";

import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { getUserFriends } from "../lib/api";

const FriendsPage = () => {
  const [search, setSearch] = useState("");

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    refetchInterval: 20 * 1000,
  });

  const filteredFriends = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return friends;

    return friends.filter((friend) =>
      [friend.fullName, friend.nativeLanguage, friend.learningLanguage, friend.location]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [friends, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UsersIcon className="size-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h1>
            </div>
            <p className="mt-1 text-sm opacity-70">
              Keep your language partners in one place and jump into a conversation.
            </p>
          </div>

          <label className="input input-bordered flex items-center gap-2 w-full sm:w-80">
            <SearchIcon className="size-4 opacity-60" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search friends..."
              aria-label="Search friends"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFriends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
