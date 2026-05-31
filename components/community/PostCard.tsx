"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Heart, Trash2, Trophy } from "lucide-react";
import { deletePost, toggleLike } from "@/app/community/actions";
import { timeAgo, cn } from "@/lib/utils";

export type PostCardData = {
  id: string;
  type: string;
  body: string;
  imageUrl: string | null;
  createdAt: string; // ISO
  authorName: string | null;
  authorImage: string | null;
  likeCount: number;
  likedByMe: boolean;
  canDelete: boolean;
};

export function PostCard({ post }: { post: PostCardData }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [deleted, setDeleted] = useState(false);
  const [pending, startTransition] = useTransition();

  if (deleted) return null;

  const isWin = post.type === "win";

  const onLike = () => {
    // Optimistic toggle
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    startTransition(async () => {
      const result = await toggleLike(post.id);
      if (!result.ok) {
        // revert
        setLiked(!next);
        setLikeCount((c) => c + (next ? -1 : 1));
        toast.error(result.error);
      }
    });
  };

  const onDelete = () => {
    if (!confirm("Delete this post?")) return;
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (result.ok) {
        setDeleted(true);
        toast.success("Post deleted.");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <article
      className={cn(
        "surface rounded-2xl border p-5",
        isWin ? "border-amber-500/30" : "border-theme"
      )}
    >
      <div className="flex items-start gap-3">
        {post.authorImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.authorImage}
            alt=""
            referrerPolicy="no-referrer"
            className="h-10 w-10 flex-shrink-0 rounded-full"
          />
        ) : (
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple/15 text-sm font-medium text-purple-700 dark:text-purple-200">
            {post.authorName?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-fg">
              {post.authorName ?? "Member"}
            </span>
            {isWin && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <Trophy className="h-3 w-3" />
                Big win
              </span>
            )}
            <span className="text-xs text-muted">· {timeAgo(post.createdAt)}</span>
          </div>
        </div>
        {post.canDelete && (
          <button
            onClick={onDelete}
            disabled={pending}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-300"
            title="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-balance text-sm leading-relaxed text-fg">
        {post.body}
      </p>

      {post.imageUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-theme">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="max-h-[480px] w-full object-cover"
          />
        </div>
      )}

      <div className="mt-4 flex items-center gap-1 border-t border-theme pt-3">
        <button
          onClick={onLike}
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
            liked
              ? "text-rose-600 dark:text-rose-400"
              : "text-muted hover:bg-purple/5 hover:text-fg"
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          {likeCount > 0 ? likeCount : ""} {likeCount === 1 ? "like" : "likes"}
        </button>
      </div>
    </article>
  );
}
