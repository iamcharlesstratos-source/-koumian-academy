"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SmilePlus, Trash2, Trophy, MessageCircle, Send, Loader2 } from "lucide-react";
import {
  deletePost,
  setReaction,
  createComment,
  deleteComment,
} from "@/app/community/actions";
import { timeAgo, cn } from "@/lib/utils";

const REACTIONS: { type: string; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "clap", emoji: "👏", label: "Clap" },
  { type: "insight", emoji: "💡", label: "Insight" },
];
const EMOJI: Record<string, string> = Object.fromEntries(
  REACTIONS.map((r) => [r.type, r.emoji])
);

export type CommentData = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string | null;
  authorImage: string | null;
  canDelete: boolean;
};

export type PostCardData = {
  id: string;
  type: string;
  body: string;
  imageUrl: string | null;
  createdAt: string;
  authorName: string | null;
  authorImage: string | null;
  reactions: { type: string; count: number }[];
  myReaction: string | null;
  canDelete: boolean;
  comments: CommentData[];
};

function Avatar({
  name,
  image,
  size = "md",
}: {
  name: string | null;
  image: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        className={cn("flex-shrink-0 rounded-full", dim)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full bg-purple/15 font-medium text-purple-700 dark:text-purple-200",
        dim
      )}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

export function PostCard({ post }: { post: PostCardData }) {
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const r of post.reactions) init[r.type] = r.count;
    return init;
  });
  const [myReaction, setMyReaction] = useState<string | null>(post.myReaction);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [pending, startTransition] = useTransition();

  if (deleted) return null;

  const isWin = post.type === "win";

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const presentEmojis = REACTIONS.filter((r) => (counts[r.type] ?? 0) > 0)
    .map((r) => r.emoji)
    .slice(0, 3);

  const react = (type: string) => {
    const prevMy = myReaction;
    const prevCounts = counts;
    const next = { ...counts };
    if (prevMy === type) {
      next[type] = Math.max(0, (next[type] ?? 0) - 1);
      setMyReaction(null);
    } else {
      if (prevMy) next[prevMy] = Math.max(0, (next[prevMy] ?? 0) - 1);
      next[type] = (next[type] ?? 0) + 1;
      setMyReaction(type);
    }
    setCounts(next);
    startTransition(async () => {
      const result = await setReaction(post.id, type);
      if (!result.ok) {
        setMyReaction(prevMy);
        setCounts(prevCounts);
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
      } else toast.error(result.error);
    });
  };

  const onComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    startTransition(async () => {
      const result = await createComment(post.id, text);
      if (result.ok) {
        // Use the real persisted row (real id + author) so the comment is
        // immediately deletable and shows the correct name/avatar.
        setComments((c) => [
          ...c,
          {
            id: result.comment.id,
            body: result.comment.body,
            createdAt: result.comment.createdAt,
            authorName: result.comment.authorName,
            authorImage: result.comment.authorImage,
            canDelete: true,
          },
        ]);
        setCommentText("");
      } else toast.error(result.error);
    });
  };

  const onDeleteComment = (id: string) => {
    startTransition(async () => {
      const result = await deleteComment(id);
      if (result.ok) {
        setComments((c) => c.filter((x) => x.id !== id));
      } else toast.error(result.error);
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
        <Avatar name={post.authorName} image={post.authorImage} />
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
        <div
          className="relative"
          onMouseEnter={() => setPickerOpen(true)}
          onMouseLeave={() => setPickerOpen(false)}
        >
          <button
            onClick={() => setPickerOpen((v) => !v)}
            disabled={pending}
            aria-haspopup="true"
            aria-expanded={pickerOpen}
            aria-label={`React to post${total > 0 ? ` (${total})` : ""}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
              myReaction
                ? "font-medium text-purple-700 dark:text-purple-200"
                : "text-muted hover:bg-purple/5 hover:text-fg"
            )}
          >
            {total > 0 ? (
              <>
                <span className="text-base leading-none">
                  {presentEmojis.join("")}
                </span>
                <span>{total}</span>
              </>
            ) : (
              <>
                <SmilePlus className="h-4 w-4" />
                React
              </>
            )}
          </button>

          {/* Reaction picker — opens on hover (desktop) or tap (mobile). */}
          {pickerOpen && (
            <div
              role="menu"
              className="surface absolute bottom-full left-0 z-20 mb-2 flex gap-0.5 rounded-full border border-theme-strong p-1.5 shadow-lg"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  role="menuitem"
                  onClick={() => {
                    react(r.type);
                    setPickerOpen(false);
                  }}
                  disabled={pending}
                  title={r.label}
                  aria-label={r.label}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-lg transition-transform hover:scale-125",
                    myReaction === r.type && "bg-purple/15"
                  )}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-purple/5 hover:text-fg"
        >
          <MessageCircle className="h-4 w-4" />
          {comments.length > 0 ? comments.length : ""} Comment
          {comments.length === 1 ? "" : "s"}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-3 border-t border-theme pt-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <Avatar name={c.authorName} image={c.authorImage} size="sm" />
              <div className="min-w-0 flex-1 rounded-xl bg-current/[0.03] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-medium text-fg">
                    {c.authorName ?? "Member"}
                  </span>
                  <span className="text-[10px] text-muted">
                    {timeAgo(c.createdAt)}
                  </span>
                  {c.canDelete && !c.id.startsWith("temp-") && (
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      className="ml-auto text-muted transition-colors hover:text-rose-500"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-fg">
                  {c.body}
                </p>
              </div>
            </div>
          ))}

          <form onSubmit={onComment} className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              maxLength={1000}
              className="flex-1 rounded-full border border-theme bg-current/[0.02] px-4 py-2 text-sm text-fg placeholder:text-muted focus:border-purple/60 focus:outline-none focus:ring-1 focus:ring-purple/30"
            />
            <button
              type="submit"
              disabled={pending || !commentText.trim()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple text-white transition-colors hover:bg-purple-600 disabled:opacity-40"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
