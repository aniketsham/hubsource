"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { resourceService } from "@/services/resourceService";
import { Resource } from "@/types";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function SavedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLikedIds(new Set(user.likes ?? []));
    setSavedIds(new Set(user.saves ?? []));

    const fetchSaved = async () => {
      setLoading(true);
      try {
        const data = await resourceService.getSaved();
        setSavedResources(data || []);
      } catch {
        toast.error("Failed to load saved resources");
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [user, router]);

  const handleLike = useCallback(
    async (resourceId: string) => {
      if (!user) return;
      const wasLiked = likedIds.has(resourceId);
      setLikedIds((prev) => {
        const n = new Set(prev);
        wasLiked ? n.delete(resourceId) : n.add(resourceId);
        return n;
      });
      setSavedResources((prev) =>
        prev.map((r) =>
          r.id === resourceId
            ? { ...r, likesCount: r.likesCount + (wasLiked ? -1 : 1) }
            : r,
        ),
      );
      try {
        const { liked, likesCount } =
          await resourceService.toggleLike(resourceId);
        setLikedIds((prev) => {
          const n = new Set(prev);
          liked ? n.add(resourceId) : n.delete(resourceId);
          return n;
        });
        setSavedResources((prev) =>
          prev.map((r) => (r.id === resourceId ? { ...r, likesCount } : r)),
        );
      } catch {
        setLikedIds((prev) => {
          const n = new Set(prev);
          wasLiked ? n.add(resourceId) : n.delete(resourceId);
          return n;
        });
        toast.error("Failed to update like");
      }
    },
    [user, likedIds],
  );

  const handleSave = useCallback(
    async (resourceId: string) => {
      if (!user) return;
      const wasSaved = savedIds.has(resourceId);
      setSavedIds((prev) => {
        const n = new Set(prev);
        wasSaved ? n.delete(resourceId) : n.add(resourceId);
        return n;
      });
      // Remove from list immediately when unsaving
      if (wasSaved)
        setSavedResources((prev) => prev.filter((r) => r.id !== resourceId));
      try {
        const { saved } = await resourceService.toggleSave(resourceId);
        setSavedIds((prev) => {
          const n = new Set(prev);
          saved ? n.add(resourceId) : n.delete(resourceId);
          return n;
        });
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
        const data = await resourceService.getSaved();
        setSavedResources(data || []);
        toast.error("Failed to update save");
      }
    },
    [user, savedIds],
  );

  return (
    <div className="container mx-auto px-8 py-12 max-w-7xl space-y-10">
      <div className="flex items-center gap-4 border-b-4 border-black pb-8">
        <Bookmark className="h-10 w-10" />
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">
            Saved Archive
          </h1>
          <p className="text-sm font-medium uppercase text-foreground/60 italic mt-1">
            Your bookmarked resources — all in one place.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : savedResources.length > 0 ? (
        <>
          <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
            {savedResources.length} resource
            {savedResources.length !== 1 ? "s" : ""} saved
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
        </>
      ) : (
        <div className="border-4 border-black border-dashed py-24 bg-white shadow-neo text-center space-y-6">
          <Bookmark className="h-16 w-16 text-foreground/20 mx-auto" />
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
            <Link href="/resources">Explore Feed</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
