"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, ImagePlus, Send, Trophy } from "lucide-react";
import { createPost } from "@/app/community/actions";

export function PostComposer({
  type = "feed",
  authorName,
  authorImage,
}: {
  type?: "feed" | "win";
  authorName?: string | null;
  authorImage?: string | null;
}) {
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [pending, startTransition] = useTransition();

  const isWin = type === "win";

  const submit = () => {
    if (!body.trim()) {
      toast.error("Write something first.");
      return;
    }
    startTransition(async () => {
      const result = await createPost({
        body,
        type,
        imageUrl: imageUrl || undefined,
      });
      if (result.ok) {
        setBody("");
        setImageUrl("");
        setShowImage(false);
        toast.success(isWin ? "Big win shared! 🎉" : "Posted!");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="surface rounded-2xl border border-theme p-4 sm:p-5">
      <div className="flex gap-3">
        {authorImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={authorImage}
            alt=""
            referrerPolicy="no-referrer"
            className="h-10 w-10 flex-shrink-0 rounded-full"
          />
        ) : (
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple/15 text-sm font-medium text-purple-700 dark:text-purple-200">
            {authorName?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={
              isWin
                ? "Share a big win 🎉 — a milestone, a result, a breakthrough…"
                : "Share something with the community…"
            }
            className="w-full resize-none rounded-xl border border-theme bg-current/[0.02] px-4 py-3 text-sm text-fg placeholder:text-muted focus:border-purple/60 focus:outline-none focus:ring-1 focus:ring-purple/30"
          />

          {showImage && (
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste an image URL (optional)"
              className="mt-2 w-full rounded-lg border border-theme bg-current/[0.02] px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-purple/60 focus:outline-none focus:ring-1 focus:ring-purple/30"
            />
          )}

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowImage((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-purple/5 hover:text-fg"
            >
              <ImagePlus className="h-4 w-4" />
              {showImage ? "Hide image" : "Add image"}
            </button>
            <button
              onClick={submit}
              disabled={pending}
              className="btn-primary text-sm"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isWin ? (
                <Trophy className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isWin ? "Share win" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
