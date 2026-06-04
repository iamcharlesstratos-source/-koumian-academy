"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, ImagePlus, Send, Trophy, X } from "lucide-react";
import { createPost } from "@/app/community/actions";

/**
 * Read an image File, downscale to fit within `max` px (preserving aspect
 * ratio), and return a compressed JPEG data URL — entirely in the browser.
 * Keeps feed photos small (~100-300KB) so we can store them inline.
 */
async function compressImage(file: File, max = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > max || height > max) {
        const scale = Math.min(max / width, max / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no-canvas"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("bad-image"));
    };
    img.src = objectUrl;
  });
}

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
  const [processing, setProcessing] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const isWin = type === "win";

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setProcessing(true);
    try {
      const dataUrl = await compressImage(file);
      setImageUrl(dataUrl);
    } catch {
      toast.error("Couldn't process that image.");
    } finally {
      setProcessing(false);
    }
  };

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

          {/* Image preview */}
          {imageUrl && (
            <div className="relative mt-3 overflow-hidden rounded-xl border border-theme">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Selected attachment"
                className="max-h-72 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                aria-label="Remove image"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPickFile}
            className="hidden"
          />

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={processing}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-purple/5 hover:text-fg disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {processing ? "Processing…" : imageUrl ? "Change photo" : "Add photo"}
            </button>
            <button
              onClick={submit}
              disabled={pending || processing}
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
