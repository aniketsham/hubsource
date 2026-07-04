"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Trophy,
  Heart,
  Bookmark,
  LayoutGrid,
  Medal,
  Crown,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LeaderboardEntry {
  userId: string;
  postedByName: string;
  submissionsCount: number;
  totalLikes: number;
  totalSaves: number;
  score: number;
}

const RANK_STYLES: Record<
  number,
  {
    bg: string;
    border: string;
    podiumBg: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  1: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    podiumBg: "bg-yellow-400",
    icon: <Crown className="h-5 w-5 text-yellow-600 fill-yellow-400" />,
    label: "#1",
  },
  2: {
    bg: "bg-gray-50",
    border: "border-gray-400",
    podiumBg: "bg-gray-300",
    icon: <Medal className="h-5 w-5 text-gray-500" />,
    label: "#2",
  },
  3: {
    bg: "bg-orange-50",
    border: "border-orange-400",
    podiumBg: "bg-orange-300",
    icon: <Medal className="h-5 w-5 text-orange-500" />,
    label: "#3",
  },
};

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  heightClass: string;
  avatarSize: string;
  isFollowing: boolean;
  isSelf: boolean;
  onFollow: (userId: string) => void;
}

function PodiumCard({
  entry,
  rank,
  heightClass,
  avatarSize,
  isFollowing,
  isSelf,
  onFollow,
}: PodiumCardProps) {
  const style = RANK_STYLES[rank];
  return (
    <div className="flex flex-col items-center flex-1 max-w-[220px]">
      {/* Avatar + info above the podium block */}
      <div
        className={`flex flex-col items-center text-center gap-2 px-4 py-4 w-full border-4 ${style.border} ${style.bg} shadow-neo mb-0`}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
          {style.icon} {style.label}
        </div>
        <div
          className={`${avatarSize} rounded-full border-4 border-black bg-indigo-200 flex items-center justify-center font-black text-xl`}
        >
          {entry.postedByName[0]?.toUpperCase()}
        </div>
        <p className="font-black uppercase tracking-tight text-sm leading-tight w-full truncate">
          @{entry.postedByName.toLowerCase().replace(/\s+/g, "_")}
        </p>
        <div className="font-black text-2xl">{entry.score}</div>
        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/50 -mt-1">
          pts
        </p>
        <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest text-foreground/60">
          <span className="flex items-center gap-0.5">
            <LayoutGrid className="h-2.5 w-2.5" /> {entry.submissionsCount}
          </span>
          <span className="flex items-center gap-0.5">
            <Heart className="h-2.5 w-2.5" /> {entry.totalLikes}
          </span>
          <span className="flex items-center gap-0.5">
            <Bookmark className="h-2.5 w-2.5" /> {entry.totalSaves}
          </span>
        </div>
        {!isSelf && (
          <button
            onClick={() => onFollow(entry.userId)}
            className={`mt-1 w-full flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border-2 transition-colors ${
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
        )}
      </div>
      {/* Podium block */}
      <div
        className={`w-full ${heightClass} ${style.podiumBg} border-4 border-t-0 ${style.border} flex items-start justify-center pt-3`}
      >
        <span className="text-4xl font-black text-black/20">{rank}</span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFollowingIds(new Set(user?.following ?? []));
  }, [user]);

  const handleFollow = useCallback(
    async (targetId: string) => {
      if (!user) {
        toast.error("Log in to follow contributors");
        router.push("/login");
        return;
      }
      const wasFollowing = followingIds.has(targetId);
      setFollowingIds((prev) => {
        const n = new Set(prev);
        wasFollowing ? n.delete(targetId) : n.add(targetId);
        return n;
      });
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
        setFollowingIds((prev) => {
          const n = new Set(prev);
          wasFollowing ? n.add(targetId) : n.delete(targetId);
          return n;
        });
        toast.error("Failed to update follow");
      }
    },
    [user, followingIds, router, refreshUser],
  );

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="container mx-auto px-8 py-12 max-w-4xl space-y-12">
      {/* Header */}
      <div className="border-b-4 border-black pb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-14 w-14 bg-black flex items-center justify-center shadow-neo">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter">
              Leaderboard
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mt-1">
              Top contributors ranked by score
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-20 border-2 border-black bg-white animate-pulse shadow-neo"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-black bg-white shadow-neo gap-4">
          <Trophy className="h-16 w-16 text-foreground/20" />
          <p className="text-xl font-black uppercase tracking-tight">
            No contributors yet
          </p>
          <p className="text-xs font-bold text-foreground/50 uppercase">
            Be the first to submit an approved resource.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium — order: 2nd left, 1st centre, 3rd right */}
          {podium.length > 0 && (
            <div className="flex items-end justify-center gap-4">
              {/* 2nd place */}
              {podium[1] && (
                <PodiumCard
                  entry={podium[1]}
                  rank={2}
                  heightClass="h-52"
                  avatarSize="h-14 w-14"
                  isFollowing={followingIds.has(podium[1].userId)}
                  isSelf={user?.id === podium[1].userId}
                  onFollow={handleFollow}
                />
              )}
              {/* 1st place — tallest */}
              {podium[0] && (
                <PodiumCard
                  entry={podium[0]}
                  rank={1}
                  heightClass="h-64"
                  avatarSize="h-20 w-20"
                  isFollowing={followingIds.has(podium[0].userId)}
                  isSelf={user?.id === podium[0].userId}
                  onFollow={handleFollow}
                />
              )}
              {/* 3rd place */}
              {podium[2] && (
                <PodiumCard
                  entry={podium[2]}
                  rank={3}
                  heightClass="h-44"
                  avatarSize="h-12 w-12"
                  isFollowing={followingIds.has(podium[2].userId)}
                  isSelf={user?.id === podium[2].userId}
                  onFollow={handleFollow}
                />
              )}
            </div>
          )}

          {/* Ranks 4+ — table */}
          {rest.length > 0 && (
            <div className="border-4 border-black shadow-neo overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[48px_1fr_80px_80px_80px_80px_100px] items-center bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest">
                <span>#</span>
                <span>Contributor</span>
                <span className="text-center hidden sm:block">Posts</span>
                <span className="text-center hidden sm:block">Likes</span>
                <span className="text-center hidden sm:block">Saves</span>
                <span className="text-center">Score</span>
                <span></span>
              </div>
              {rest.map((entry, i) => {
                const rank = i + 4;
                const isFollowing = followingIds.has(entry.userId);
                const isSelf = user?.id === entry.userId;
                return (
                  <div
                    key={entry.userId}
                    className="grid grid-cols-[48px_1fr_80px_80px_80px_80px_100px] items-center px-6 py-4 border-t-2 border-black bg-white hover:bg-[#F3F3F1] transition-colors"
                  >
                    <span className="text-lg font-black text-foreground/40">
                      {rank}
                    </span>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full border-2 border-black bg-indigo-100 flex items-center justify-center font-black text-sm shrink-0">
                        {entry.postedByName[0]?.toUpperCase()}
                      </div>
                      <p className="font-black uppercase tracking-tight text-sm truncate">
                        @{entry.postedByName.toLowerCase().replace(/\s+/g, "_")}
                      </p>
                    </div>
                    <span className="text-center text-sm font-black hidden sm:block">
                      {entry.submissionsCount}
                    </span>
                    <span className="text-center text-sm font-black hidden sm:block">
                      {entry.totalLikes}
                    </span>
                    <span className="text-center text-sm font-black hidden sm:block">
                      {entry.totalSaves}
                    </span>
                    <span className="text-center text-sm font-black">
                      {entry.score}
                    </span>
                    <div className="flex justify-center">
                      {!isSelf && (
                        <button
                          onClick={() => handleFollow(entry.userId)}
                          className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 border-2 transition-colors ${
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
