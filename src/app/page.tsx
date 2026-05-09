"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Hero } from "../components/landing/Hero";
import { ResourceCard } from "../components/cards/ResourceCard";
import { CategoryFilter } from "../components/Resource/CategoryFilter";
import { resourceService } from "../services/resourceService";
import { Resource } from "../types";
import {
  ArrowRight,
  Star,
  PackageOpen,
  Search,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { useAuth } from "../components/AuthProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, patchUserLikes, patchUserSaves } = useAuth();
  const router = useRouter();
  const [featured, setFeatured] = useState<Resource[]>([]);
  const [latest, setLatest] = useState<Resource[]>([]);
  const [popular, setPopular] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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
      const updateCount = (list: Resource[]) =>
        list.map((r) =>
          r.id === resourceId
            ? { ...r, likesCount: r.likesCount + (wasLiked ? -1 : 1) }
            : r,
        );
      setFeatured((prev) => updateCount(prev));
      setLatest((prev) => updateCount(prev));
      setPopular((prev) => updateCount(prev));
      try {
        const { liked, likesCount } =
          await resourceService.toggleLike(resourceId);
        setLikedIds((prev) => {
          const n = new Set(prev);
          liked ? n.add(resourceId) : n.delete(resourceId);
          // keep user.likes in sync so detail page reads correct state
          patchUserLikes([...n]);
          return n;
        });
        const syncCount = (list: Resource[]) =>
          list.map((r) => (r.id === resourceId ? { ...r, likesCount } : r));
        setFeatured((prev) => syncCount(prev));
        setLatest((prev) => syncCount(prev));
        setPopular((prev) => syncCount(prev));
      } catch {
        setLikedIds((prev) => {
          const n = new Set(prev);
          wasLiked ? n.add(resourceId) : n.delete(resourceId);
          return n;
        });
        const revertCount = (list: Resource[]) =>
          list.map((r) =>
            r.id === resourceId
              ? { ...r, likesCount: r.likesCount + (wasLiked ? 1 : -1) }
              : r,
          );
        setFeatured((prev) => revertCount(prev));
        setLatest((prev) => revertCount(prev));
        setPopular((prev) => revertCount(prev));
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [featuredRes, latestRes] = await Promise.all([
          resourceService.getAll({ isFeatured: true }),
          resourceService.getAll({}),
        ]);
        setFeatured(featuredRes ?? []);
        setLatest(latestRes ?? []);
        const sorted = [...(latestRes ?? [])]
          .sort((a, b) => b.likesCount - a.likesCount)
          .filter((r) => r.likesCount > 0)
          .slice(0, 6);
        setPopular(sorted);
      } catch {
        setFeatured([]);
        setLatest([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredLatest =
    selectedCategory === "All"
      ? latest
      : latest.filter((r) => r.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      <main className="container mx-auto px-8 py-12 space-y-16">
        {/* Featured Section */}
        {!loading && featured.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-end justify-between border-b-2 border-black pb-4">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-primary fill-current" />
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  Featured Resources
                </h2>
              </div>
              <Link
                href="/resources"
                className="text-primary text-xs font-black uppercase flex items-center gap-1 hover:underline underline-offset-4 decoration-2"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.slice(0, 3).map((resource) => (
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
          </section>
        )}

        {/* Loading skeletons for featured */}
        {loading && (
          <section className="space-y-8">
            <div className="h-10 w-72 border-2 border-black bg-white animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 border-2 border-black bg-white animate-pulse shadow-neo"
                />
              ))}
            </div>
          </section>
        )}

        {/* Most Popular */}
        {!loading && popular.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-end justify-between border-b-2 border-black pb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  Most Popular
                </h2>
              </div>
              <Link
                href="/resources"
                className="text-primary text-xs font-black uppercase flex items-center gap-1 hover:underline underline-offset-4 decoration-2"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popular.map((resource) => (
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
          </section>
        )}

        {/* Latest Resources */}
        <section className="space-y-8">
          <div className="flex flex-col gap-6 border-b-2 border-black pb-4">
            <h2 className="text-3xl font-black uppercase tracking-tight">
              Discover Latest
            </h2>
            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 border-2 border-black bg-white animate-pulse shadow-neo"
                />
              ))}
            </div>
          ) : filteredLatest.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLatest.map((resource) => (
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
          ) : selectedCategory !== "All" ? (
            /* Category filter empty state */
            <div className="flex flex-col items-center justify-center py-24 border-2 border-black bg-white shadow-neo gap-6">
              <div className="w-16 h-16 border-2 border-black bg-indigo-100 flex items-center justify-center">
                <Search className="h-8 w-8 text-black" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-black uppercase tracking-tight">
                  No results in "{selectedCategory}"
                </p>
                <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
                  No approved resources in this category yet. Be the first to
                  submit one.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-2 border-black font-black uppercase text-xs tracking-widest"
                  onClick={() => setSelectedCategory("All")}
                >
                  Clear Filter
                </Button>
                <Button
                  asChild
                  className="font-black uppercase text-xs tracking-widest"
                >
                  <Link href="/submit">Submit Resource</Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Fully empty state — no resources at all */
            <div className="flex flex-col items-center justify-center py-24 border-2 border-black bg-white shadow-neo gap-6">
              <div className="w-16 h-16 border-2 border-black bg-foreground flex items-center justify-center">
                <PackageOpen className="h-8 w-8 text-background" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-black uppercase tracking-tight">
                  Nothing here yet
                </p>
                <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                  The community hasn&apos;t submitted any resources yet. Be the
                  first to share something great.
                </p>
              </div>
              <Button
                asChild
                className="font-black uppercase text-xs tracking-widest px-8 h-12"
              >
                <Link href="/submit">Submit the First Resource</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
