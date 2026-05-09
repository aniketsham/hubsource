"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { resourceService } from "@/services/resourceService";
import { Resource, Comment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ExternalLink,
  Heart,
  Bookmark,
  Share2,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Star as StarIcon,
  Trash2,
  Loader2,
  CornerDownRight,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { Textarea } from "@/components/ui/textarea";

export default function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // commentId
  const [replyText, setReplyText] = useState("");
  useEffect(() => {
    if (!id) return;
    const fetchResource = async () => {
      setLoading(true);
      try {
        const res = await resourceService.getById(id);
        setResource(res);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const data = await resourceService.getComments(id);
        setComments(data);
      } catch {
        // silently fail — comments just won't show
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [id]);

  // Sync liked/saved from user data
  useEffect(() => {
    if (!user || !id) return;
    setLiked(user.likes?.includes(id) ?? false);
    setSaved(user.saves?.includes(id) ?? false);
  }, [user, id]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Log in to like resources");
      return router.push("/login");
    }
    try {
      const { liked: newLiked, likesCount } =
        await resourceService.toggleLike(id);
      setLiked(newLiked);
      setResource((r) => (r ? { ...r, likesCount } : r));
    } catch {
      toast.error("Failed to update like");
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Log in to save resources");
      return router.push("/login");
    }
    try {
      const { saved: newSaved } = await resourceService.toggleSave(id);
      setSaved(newSaved);
      toast.success(newSaved ? "Saved!" : "Removed from saves");
    } catch {
      toast.error("Failed to update save");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleAddComment = async () => {
    if (!user) return toast.error("Log in to comment");
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const newComment = await resourceService.postComment(id, comment.trim());
      setComments((prev) => [{ ...newComment, replies: [] }, ...prev]);
      setComment("");
      toast.success("Comment posted!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to post comment",
      );
    } finally {
      setPosting(false);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!user) return toast.error("Log in to reply");
    if (!replyText.trim()) return;
    setPosting(true);
    try {
      const newReply = await resourceService.postComment(
        id,
        replyText.trim(),
        parentId,
      );
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), newReply] }
            : c,
        ),
      );
      setReplyText("");
      setReplyingTo(null);
      toast.success("Reply posted!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (
    commentId: string,
    parentId?: string | null,
  ) => {
    try {
      await resourceService.deleteComment(id, commentId);
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: (c.replies ?? []).filter((r) => r.id !== commentId),
                }
              : c,
          ),
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full shadow-neo" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-8 py-20 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter">
          Signal Lost
        </h2>
        <Button
          onClick={() => router.push("/resources")}
          className="mt-8 h-12 px-8 font-black uppercase shadow-neo"
        >
          Return to Feed
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-12 max-w-7xl">
      <Button
        variant="ghost"
        className="mb-8 font-black uppercase tracking-widest text-xs"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Header */}
          <div className="space-y-6 border-b-4 border-black pb-8">
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="bg-indigo-100 text-black border-2 border-black px-4 py-1 font-black uppercase tracking-widest"
              >
                {resource.category}
              </Badge>
              {resource.isFeatured && (
                <Badge
                  variant="default"
                  className="gap-1 border-2 border-black font-black uppercase tracking-widest"
                >
                  <StarIcon className="h-3 w-3 fill-current" /> Featured
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
              {resource.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-foreground/70">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-black">
                  <AvatarFallback>{resource.postedByName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-foreground">
                  @{resource.postedByName.toLowerCase().replace(/\s+/g, "_")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(resource.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{resource.likesCount} Likes</span>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="aspect-video overflow-hidden border-4 border-black shadow-neo-lg">
            <img
              src={
                resource.thumbnail ||
                `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80`
              }
              alt={resource.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description */}
          <div className="space-y-6">
            <h3 className="text-3xl font-black uppercase tracking-tight border-b-2 border-black pb-2 inline-block">
              About
            </h3>
            <p className="text-lg font-medium text-foreground leading-relaxed whitespace-pre-wrap uppercase">
              {resource.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            {resource.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-4 py-1 text-xs font-black uppercase border-2 border-black shadow-neo"
              >
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Comments Section */}
          <div className="space-y-8 pt-12">
            <h3 className="text-3xl font-black uppercase tracking-tight border-b-2 border-black pb-2 flex items-center gap-3">
              <MessageSquare className="h-7 w-7" /> Intelligence Hub
            </h3>

            {user ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="CONTRIBUTE TO THE DISCUSSION..."
                  className="min-h-[120px] bg-white border-4 border-black font-black placeholder:text-gray-400 p-6"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!comment.trim() || posting}
                    className="h-12 px-8 font-black uppercase tracking-widest shadow-neo"
                  >
                    {posting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    POST INTEL
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-4 border-black border-dashed bg-white p-8 text-center space-y-4">
                <p className="text-xs font-black uppercase tracking-widest">
                  Log in to join the discussion
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => router.push("/login")}
                    className="h-10 px-8 font-black uppercase tracking-widest shadow-neo"
                  >
                    Log In
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/register")}
                    className="h-10 px-8 font-black uppercase tracking-widest shadow-neo"
                  >
                    Register
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-6 pt-4">
              {commentsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-16 bg-white border-2 border-black border-dashed">
                  <p className="text-xs font-black uppercase tracking-widest">
                    No signals detected yet. Be the first to start the thread.
                  </p>
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="border-2 border-black bg-white shadow-neo"
                  >
                    {/* Top-level comment */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border-2 border-black">
                            <AvatarFallback className="text-xs font-black">
                              {c.userName?.[0]?.toUpperCase() ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest">
                              {c.userName}
                            </p>
                            <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                              {formatDistanceToNow(new Date(c.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user && !c.parentId && (
                            <button
                              onClick={() => {
                                setReplyingTo(
                                  replyingTo === c.id ? null : c.id,
                                );
                                setReplyText("");
                              }}
                              className="text-[10px] font-black uppercase tracking-widest text-foreground/50 hover:text-black flex items-center gap-1 px-2 py-1 border border-black/20 hover:border-black transition-colors"
                            >
                              <CornerDownRight className="h-3 w-3" /> Reply
                            </button>
                          )}
                          {(user?.id === c.userId || isAdmin) && (
                            <button
                              onClick={() => handleDeleteComment(c.id, null)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete comment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-medium whitespace-pre-wrap">
                        {c.content}
                      </p>
                    </div>

                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="border-t-2 border-black/10 bg-[#F9F9F7] divide-y divide-black/10">
                        {c.replies.map((r) => (
                          <div key={r.id} className="p-4 pl-8 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CornerDownRight className="h-3 w-3 text-foreground/30 -ml-4 mr-1 flex-shrink-0" />
                                <Avatar className="h-6 w-6 border-2 border-black">
                                  <AvatarFallback className="text-[10px] font-black">
                                    {r.userName?.[0]?.toUpperCase() ?? "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest">
                                    {r.userName}
                                  </p>
                                  <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-wider">
                                    {formatDistanceToNow(
                                      new Date(r.createdAt),
                                      { addSuffix: true },
                                    )}
                                  </p>
                                </div>
                              </div>
                              {(user?.id === r.userId || isAdmin) && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(r.id, c.id)
                                  }
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Delete reply"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm font-medium whitespace-pre-wrap pl-5">
                              {r.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply input box */}
                    {replyingTo === c.id && (
                      <div className="border-t-2 border-black p-4 bg-indigo-50 space-y-3">
                        <Textarea
                          placeholder={`Replying to ${c.userName}...`}
                          className="min-h-[80px] bg-white border-2 border-black font-medium text-sm placeholder:text-gray-400 p-3"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-4 font-black uppercase text-xs shadow-neo"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 px-4 font-black uppercase text-xs shadow-neo"
                            disabled={!replyText.trim() || posting}
                            onClick={() => handleAddReply(c.id)}
                          >
                            {posting ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            Post Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="border-4 border-black p-6 space-y-8 shadow-neo-lg sticky top-24 bg-white">
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter border-b-2 border-black pb-2">
                Access
              </h3>
              <Button
                className="w-full h-16 text-lg font-black uppercase tracking-widest shadow-neo"
                asChild
              >
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GOTO RESOURCE <ExternalLink className="h-6 w-6 ml-2" />
                </a>
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className={`h-12 gap-2 font-black uppercase text-xs shadow-neo ${liked ? "bg-red-500 text-white border-red-500" : ""}`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />{" "}
                  {liked ? "Liked" : "Like"}
                </Button>
                <Button
                  variant="outline"
                  className={`h-12 gap-2 font-black uppercase text-xs shadow-neo ${saved ? "bg-indigo-500 text-white border-indigo-500" : ""}`}
                  onClick={handleSave}
                >
                  <Bookmark
                    className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
                  />{" "}
                  {saved ? "Saved" : "Save"}
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full h-12 gap-2 font-black uppercase text-xs shadow-neo"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" /> Share Link
              </Button>
            </div>

            <div className="space-y-6 border-t-2 border-black pt-8">
              <h3 className="text-xl font-black uppercase tracking-tighter">
                Metadata
              </h3>
              <div className="space-y-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span className="text-foreground/50">Category</span>
                  <span className="">{resource.category}</span>
                </div>
                {resource.difficulty && (
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span className="text-foreground/50">Difficulty</span>
                    <Badge
                      variant="secondary"
                      className={`text-[9px] font-black uppercase border border-black p-0 px-1 ${
                        resource.difficulty === "BEGINNER"
                          ? "bg-green-100"
                          : resource.difficulty === "INTERMEDIATE"
                            ? "bg-yellow-100"
                            : resource.difficulty === "ADVANCED"
                              ? "bg-orange-100"
                              : "bg-red-100"
                      }`}
                    >
                      {resource.difficulty}
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span className="text-foreground/50">Timestamp</span>
                  <span className="">
                    {format(new Date(resource.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-1">
                  <span className="text-foreground/50">Verification</span>
                  <Badge
                    variant="secondary"
                    className="p-0 border-none bg-transparent font-black tracking-widest"
                  >
                    {resource.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
