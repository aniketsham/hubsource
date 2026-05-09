import React from "react";
import Link from "next/link";
import { Heart, Bookmark, ExternalLink } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Resource } from "../../types";
import { formatDistanceToNow } from "date-fns";

interface ResourceCardProps {
  resource: Resource;
  onLike?: () => void;
  onSave?: () => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onLike,
  onSave,
  isLiked,
  isSaved,
}) => {
  return (
    <Card className="flex flex-col h-full bg-white border-2 border-black p-4 shadow-neo hover:shadow-neo-hover transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="secondary"
            className="text-[10px] font-black uppercase bg-indigo-100 border border-black px-2 py-0.5"
          >
            {resource.category}
          </Badge>
          {resource.difficulty && (
            <Badge
              variant="secondary"
              className={`text-[10px] font-black uppercase border border-black px-2 py-0.5 ${
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
          )}
        </div>
        <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter shrink-0 ml-2">
          {formatDistanceToNow(new Date(resource.createdAt))} ago
        </span>
      </div>

      <div className="flex-grow">
        <Link href={`/resources/${resource.id}`} className="block">
          <h3 className="text-xl font-black leading-tight uppercase mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {resource.title}
          </h3>
        </Link>
        <p className="text-xs font-medium text-foreground/60 line-clamp-3 mb-4">
          {resource.description}
        </p>
      </div>

      <div className="mt-auto border-t-2 border-black/5 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-black bg-indigo-200 flex items-center justify-center font-black text-xs">
              {resource.postedByName?.[0] || "U"}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight">
              @
              {resource.postedByName?.toLowerCase().replace(/\s+/g, "_") ||
                "anonymous"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                onLike?.();
              }}
              className={`flex items-center gap-1 group/like ${isLiked ? "text-red-500" : "text-primary"}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs font-black">{resource.likesCount}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onSave?.();
              }}
              className={`${isSaved ? "text-primary" : "text-black"}`}
            >
              <Bookmark
                className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            variant="default"
            className="w-full h-8 text-[10px] font-black"
          >
            <Link href={`/resources/${resource.id}`}>DETAILS</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="w-10 h-8 p-0">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};
