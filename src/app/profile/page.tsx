"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { resourceService } from "@/services/resourceService";
import { Resource } from "@/types";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bookmark,
  LayoutGrid,
  Clock,
  Settings,
  Loader2,
  Users,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const [followingUsers, setFollowingUsers] = useState<NetworkUser[]>([]);
  const [followerUsers, setFollowerUsers] = useState<NetworkUser[]>([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    setLikedIds(new Set(user.likes ?? []));
    setSavedIds(new Set(user.saves ?? []));

    const fetchMyResources = async () => {
      setLoading(true);
      try {
        const data = await resourceService.getMySubmissions();
        setMyResources(data || []);
      } catch {
        setMyResources([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchSaved = async () => {
      setSavedLoading(true);
      try {
        const data = await resourceService.getSaved();
        setSavedResources(data || []);
      } catch {
        setSavedResources([]);
      } finally {
        setSavedLoading(false);
      }
    };

    fetchMyResources();
    fetchSaved();

    // Fetch following + followers user details
    const allIds = [
      ...(user.following ?? []),
      ...(user.followers ?? []),
    ].filter(Boolean);
    if (allIds.length > 0) {
      setNetworkLoading(true);
      fetch(`/api/users/batch?ids=${allIds.join(",")}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((r) => r.json())
        .then((data: NetworkUser[]) => {
          const followingSet = new Set(user.following ?? []);
          const followerSet = new Set(user.followers ?? []);
          setFollowingUsers(data.filter((u) => followingSet.has(u.id)));
          setFollowerUsers(data.filter((u) => followerSet.has(u.id)));
        })
        .catch(() => {})
        .finally(() => setNetworkLoading(false));
    }
    setFollowingIds(new Set(user.following ?? []));
  }, [user]);

  // Follow/unfollow other users from within the network tabs
  const handleFollow = useCallback(
    async (targetId: string) => {
      if (!user) return;
      const wasFollowing = followingIds.has(targetId);
      setFollowingIds((prev) => {
        const n = new Set(prev);
        wasFollowing ? n.delete(targetId) : n.add(targetId);
        return n;
      });
      // Optimistically remove from following list if unfollowing
      if (wasFollowing) {
        setFollowingUsers((prev) => prev.filter((u) => u.id !== targetId));
      }
      try {
        const res = await fetch(`/api/users/${targetId}/follow`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error();
        const { following } = await res.json();
        setFollowingIds((prev) => {
          const n = new Set(prev);
          following ? n.add(targetId) : n.delete(targetId);
          return n;
        });
        toast.success(following ? "Now following!" : "Unfollowed");
        refreshUser();
      } catch {
        // Revert
        setFollowingIds((prev) => {
          const n = new Set(prev);
          wasFollowing ? n.add(targetId) : n.delete(targetId);
          return n;
        });
        toast.error("Failed to update follow");
      }
    },
    [user, followingIds, refreshUser],
  );

  const handleLike = useCallback(
    async (resourceId: string) => {
      if (!user) {
        toast.error("Log in to like resources");
        router.push("/login");
        return;
      }
      const wasLiked = likedIds.has(resourceId);
      setLikedIds((prev) => {
        const n = new Set(prev);
        wasLiked ? n.delete(resourceId) : n.add(resourceId);
        return n;
      });
      const bump = (list: Resource[]) =>
        list.map((r) =>
          r.id === resourceId
            ? { ...r, likesCount: r.likesCount + (wasLiked ? -1 : 1) }
            : r,
        );
      setMyResources((prev) => bump(prev));
      setSavedResources((prev) => bump(prev));
      try {
        const { liked, likesCount } =
          await resourceService.toggleLike(resourceId);
        setLikedIds((prev) => {
          const n = new Set(prev);
          liked ? n.add(resourceId) : n.delete(resourceId);
          return n;
        });
        const sync = (list: Resource[]) =>
          list.map((r) => (r.id === resourceId ? { ...r, likesCount } : r));
        setMyResources((prev) => sync(prev));
        setSavedResources((prev) => sync(prev));
      } catch {
        setLikedIds((prev) => {
          const n = new Set(prev);
          wasLiked ? n.add(resourceId) : n.delete(resourceId);
          return n;
        });
        toast.error("Failed to update like");
      }
    },
    [user, likedIds, router],
  );

  const handleSave = useCallback(
    async (resourceId: string) => {
      if (!user) {
        toast.error("Log in to save resources");
        router.push("/login");
        return;
      }
      const wasSaved = savedIds.has(resourceId);
      setSavedIds((prev) => {
        const n = new Set(prev);
        wasSaved ? n.delete(resourceId) : n.add(resourceId);
        return n;
      });
      // Remove from saved list optimistically if unsaving
      if (wasSaved)
        setSavedResources((prev) => prev.filter((r) => r.id !== resourceId));
      try {
        const { saved } = await resourceService.toggleSave(resourceId);
        setSavedIds((prev) => {
          const n = new Set(prev);
          saved ? n.add(resourceId) : n.delete(resourceId);
          return n;
        });
        // If re-saved, refresh the list
        if (saved) {
          const data = await resourceService.getSaved();
          setSavedResources(data || []);
        }
        toast.success(saved ? "Saved!" : "Removed from saves");
      } catch {
        setSavedIds((prev) => {
          const n = new Set(prev);
          wasSaved ? n.add(resourceId) : n.delete(resourceId);
          return n;
        });
        if (wasSaved) {
          const data = await resourceService.getSaved();
          setSavedResources(data || []);
        }
        toast.error("Failed to update save");
      }
    },
    [user, savedIds],
  );

  if (!user) {
    return (
      <div className="container mx-auto px-8 py-20 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
          Identify Yourself
        </h2>
        <p className="text-foreground/70 uppercase font-medium italic mb-8">
          Authentication required to access this node.
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="h-12 px-10 font-black uppercase shadow-neo"
        >
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-12 max-w-6xl space-y-12">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-10 bg-white border-4 border-black p-10 shadow-neo-lg">
        <Avatar className="h-40 w-40 border-4 border-black shadow-neo rounded-none">
          <AvatarImage src={user.avatar} className="object-cover" />
          <AvatarFallback className="text-6xl font-black bg-indigo-100">
            {user.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter">
              {user.name}
            </h1>
            <LocalBadge className="">{user.role}</LocalBadge>
          </div>
          <p className="text-sm font-medium uppercase text-foreground leading-relaxed italic max-w-xl">
            {user.bio ||
              "ACTIVE AGENT IN THE HUB. CONTRIBUTING TO THE COLLECTIVE INTELLIGENCE."}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 pt-4 flex-wrap">
            <div className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-4 py-2 bg-[#F3F3F1]">
              <span>{myResources.length}</span> CONTRIBUTIONS
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-4 py-2 bg-indigo-100">
              <span>{savedResources.length}</span> SAVED
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-4 py-2 bg-green-100">
              <span>{user.followers?.length ?? 0}</span> FOLLOWERS
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-4 py-2 bg-yellow-100">
              <span>{user.following?.length ?? 0}</span> FOLLOWING
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="md:self-start h-12 w-12 border-2 border-black shadow-neo"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full ">
        <TabsList className="flex w-full  bg-white border-2 border-black p-1 mb-8 shadow-neo h-14">
          <TabsTrigger
            value="posts"
            className="flex-1 gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-black data-[state=active]:text-white rounded-none h-full"
          >
            <LayoutGrid className="h-4 w-4" /> TRANSMISSIONS
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="flex-1 gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-black data-[state=active]:text-white rounded-none h-full"
          >
            <Bookmark className="h-4 w-4" /> ARCHIVE
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="flex-1 gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-black data-[state=active]:text-white rounded-none h-full"
          >
            <UserPlus className="h-4 w-4" /> FOLLOWING
          </TabsTrigger>
          <TabsTrigger
            value="followers"
            className="flex-1 gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-black data-[state=active]:text-white rounded-none h-full"
          >
            <Users className="h-4 w-4" /> FOLLOWERS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-8 outline-none">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-white border-2 border-black shadow-neo animate-pulse"
                />
              ))}
            </div>
          ) : myResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myResources.map((resource) => (
                <div key={resource.id} className="relative">
                  <div
                    className={`absolute -top-3 left-3 z-10 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black ${
                      resource.status === "APPROVED"
                        ? "bg-green-200"
                        : resource.status === "REJECTED"
                          ? "bg-red-200"
                          : "bg-yellow-200"
                    }`}
                  >
                    {resource.status}
                  </div>
                  <ResourceCard
                    resource={resource}
                    isLiked={likedIds.has(resource.id)}
                    isSaved={savedIds.has(resource.id)}
                    onLike={() => handleLike(resource.id)}
                    onSave={() => handleSave(resource.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="border-4 border-black border-dashed py-24 bg-white shadow-neo">
              <div className="text-center space-y-6">
                <Clock className="h-16 w-16 text-foreground/30 mx-auto mb-2" />
                <p className="text-xl font-black uppercase tracking-tighter">
                  No signals broadcasted yet.
                </p>
                <Button
                  asChild
                  className="h-12 px-10 font-black uppercase tracking-widest shadow-neo"
                >
                  <Link href="/submit">INITIALIZE BROADCAST</Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="outline-none">
          {savedLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : savedResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isLiked={likedIds.has(resource.id)}
                  isSaved={savedIds.has(resource.id)}
                  onLike={() => handleLike(resource.id)}
                  onSave={() => handleSave(resource.id)}
                />
              ))}
            </div>
          ) : (
            <div className="border-4 border-black border-dashed py-24 bg-white shadow-neo text-center space-y-6">
              <Bookmark className="h-16 w-16 text-foreground/30 mx-auto" />
              <p className="text-xl font-black uppercase tracking-tighter">
                Archive is empty.
              </p>
              <p className="text-xs font-bold uppercase text-foreground/50 tracking-widest max-w-xs mx-auto">
                Bookmark resources from the feed to store them here.
              </p>
              <Button
                asChild
                className="h-12 px-10 font-black uppercase tracking-widest shadow-neo"
              >
                <Link href="/resources">EXPLORE FEED</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Following */}
        <TabsContent value="following" className="outline-none">
          {networkLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : followingUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {followingUsers.map((u) => (
                <NetworkCard
                  key={u.id}
                  netUser={u}
                  isFollowing={followingIds.has(u.id)}
                  onFollow={handleFollow}
                />
              ))}
            </div>
          ) : (
            <div className="border-4 border-black border-dashed py-24 bg-white shadow-neo text-center space-y-4">
              <UserPlus className="h-16 w-16 text-foreground/20 mx-auto" />
              <p className="text-xl font-black uppercase tracking-tight">
                Not following anyone yet.
              </p>
              <Button
                asChild
                className="h-12 px-10 font-black uppercase tracking-widest shadow-neo"
              >
                <Link href="/leaderboard">DISCOVER CONTRIBUTORS</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Followers */}
        <TabsContent value="followers" className="outline-none">
          {networkLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : followerUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {followerUsers.map((u) => (
                <NetworkCard
                  key={u.id}
                  netUser={u}
                  isFollowing={followingIds.has(u.id)}
                  onFollow={handleFollow}
                />
              ))}
            </div>
          ) : (
            <div className="border-4 border-black border-dashed py-24 bg-white shadow-neo text-center space-y-4">
              <Users className="h-16 w-16 text-foreground/20 mx-auto" />
              <p className="text-xl font-black uppercase tracking-tight">
                No followers yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NetworkUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
}

function NetworkCard({
  netUser,
  isFollowing,
  onFollow,
}: {
  netUser: NetworkUser;
  isFollowing: boolean;
  onFollow: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 bg-white border-2 border-black p-6 shadow-neo">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full border-2 border-black bg-indigo-200 flex items-center justify-center text-xl font-black shrink-0 overflow-hidden">
          {netUser.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={netUser.avatar}
              alt={netUser.name}
              className="h-full w-full object-cover"
            />
          ) : (
            netUser.name[0]?.toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="font-black uppercase tracking-tight truncate">
            {netUser.name}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
            {netUser.role}
          </p>
        </div>
      </div>
      {netUser.bio && (
        <p className="text-xs font-medium text-foreground/60 italic line-clamp-2">
          {netUser.bio}
        </p>
      )}
      <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-foreground/60">
        <span>
          <span className="text-black">{netUser.followersCount}</span> FOLLOWERS
        </span>
        <span>
          <span className="text-black">{netUser.followingCount}</span> FOLLOWING
        </span>
      </div>
      <button
        onClick={() => onFollow(netUser.id)}
        className={`flex items-center justify-center gap-2 w-full py-2 border-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
          isFollowing
            ? "border-black bg-black text-white hover:bg-white hover:text-black"
            : "border-black bg-white text-black hover:bg-black hover:text-white"
        }`}
      >
        {isFollowing ? (
          <>
            <UserCheck className="h-3 w-3" /> Following
          </>
        ) : (
          <>
            <UserPlus className="h-3 w-3" /> Follow
          </>
        )}
      </button>
    </div>
  );
}

const LocalBadge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`px-4 py-1 border-2 border-black bg-indigo-100 text-black text-[10px] font-black uppercase tracking-widest ${className}`}
  >
    {children}
  </span>
);
