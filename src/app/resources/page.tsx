"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { resourceService } from "@/services/resourceService";
import { Resource } from "@/types";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { CategoryFilter } from "@/components/Resource/CategoryFilter";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export default function BrowsePage() {
  const { user, patchUserLikes, patchUserSaves } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const res = await resourceService.getAll({});
        setResources(res || []);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    if (user) {
      setLikedIds(new Set(user.likes ?? []));
      setSavedIds(new Set(user.saves ?? []));
    } else {
      setLikedIds(new Set());
      setSavedIds(new Set());
    }
  }, [user]);

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
      setResources((prev) =>
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
          patchUserLikes([...n]);
          return n;
        });
        setResources((prev) =>
          prev.map((r) => (r.id === resourceId ? { ...r, likesCount } : r)),
        );
      } catch {
        setLikedIds((prev) => {
          const n = new Set(prev);
          wasLiked ? n.add(resourceId) : n.delete(resourceId);
          return n;
        });
        setResources((prev) =>
          prev.map((r) =>
            r.id === resourceId
              ? { ...r, likesCount: r.likesCount + (wasLiked ? 1 : -1) }
              : r,
          ),
        );
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
      try {
        const { saved } = await resourceService.toggleSave(resourceId);
        setSavedIds((prev) => {
          const n = new Set(prev);
          saved ? n.add(resourceId) : n.delete(resourceId);
          patchUserSaves([...n]);
          return n;
        });
        toast.success(saved ? "Saved!" : "Removed from saves");
      } catch {
        setSavedIds((prev) => {
          const n = new Set(prev);
          wasSaved ? n.add(resourceId) : n.delete(resourceId);
          return n;
        });
        toast.error("Failed to update save");
      }
    },
    [user, savedIds, router],
  );

  const filtered = resources.filter((r) => {
    const matchesCategory =
      selectedCategory === "All" || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-8 py-12 space-y-10">
      <div className="space-y-4 border-b-4 border-black pb-8">
        <h1 className="text-6xl font-black uppercase tracking-tighter">
          Explore Signals
        </h1>
        <p className="text-foreground/70 max-w-2xl font-medium uppercase text-sm italic">
          Browse our curated collection of tools, courses, and guides shared by
          the community.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b-2 border-black pb-8">
        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <div className="relative w-full md:w-80">
          <Input
            placeholder="SEARCH FEED..."
            className="h-10 bg-white border-2 border-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-72 bg-white border-2 border-black animate-pulse shadow-neo"
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((resource) => (
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
        <div className="text-center py-20 bg-white border-2 border-black shadow-neo border-dashed">
          <p className="text-xs font-black uppercase tracking-widest">
            No resources found matching your current filter.
          </p>
        </div>
      )}
    </div>
  );
}
