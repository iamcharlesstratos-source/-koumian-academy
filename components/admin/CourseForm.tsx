"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2, PlayCircle, Video as VideoIcon } from "lucide-react";
import { createCourse, updateCourse, deleteCourse } from "@/app/admin/courses/actions";
import { CATEGORIES, LEVELS, slugify } from "@/lib/utils";
import { resolveVideo } from "@/lib/video";

const TRAILER_TYPES = [
  { id: "auto", label: "Auto-detect" },
  { id: "youtube", label: "YouTube" },
  { id: "vimeo", label: "Vimeo" },
  { id: "googleDrive", label: "Google Drive" },
  { id: "loom", label: "Loom" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "mp4", label: "Direct .mp4" },
];

type Initial = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  durationMin: number;
  priceCents: number;
  published: boolean;
  trailerUrl?: string | null;
  trailerType?: string | null;
};

export function CourseForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [level, setLevel] = useState(initial?.level ?? LEVELS[0]);
  const [durationMin, setDurationMin] = useState(initial?.durationMin ?? 60);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [trailerUrl, setTrailerUrl] = useState(initial?.trailerUrl ?? "");
  const [trailerType, setTrailerType] = useState(initial?.trailerType ?? "auto");

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const submit = () => {
    setError(null);
    const payload = {
      title,
      slug,
      description,
      category,
      level,
      durationMin: Number(durationMin) || 0,
      priceCents: 0, // Pricing removed from the UI — kept at 0 for back-compat.
      published,
      trailerUrl: trailerUrl.trim() || null,
      trailerType: trailerUrl.trim() ? trailerType : null,
    };
    startTransition(async () => {
      try {
        if (initial?.id) {
          await updateCourse(initial.id, payload);
        } else {
          await createCourse(payload);
        }
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (!msg.includes("NEXT_REDIRECT")) setError(msg);
      }
    });
  };

  const remove = () => {
    if (!initial?.id) return;
    if (!confirm("Delete this course and all its lessons? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteCourse(initial.id!);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (!msg.includes("NEXT_REDIRECT")) setError(msg);
      }
    });
  };

  return (
    <div className="surface rounded-2xl border border-theme p-6 backdrop-blur-sm">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Foundations of Modern Marketing"
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">URL slug</label>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-theme bg-current/[0.02] px-3 py-2.5 text-sm text-muted">
              /courses/
            </span>
            <input
              className="input"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="foundations-of-modern-marketing"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea
            className="input min-h-[120px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short, punchy description shown on the catalog card."
            rows={4}
          />
        </div>

        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Level</label>
          <select
            className="input"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l[0].toUpperCase() + l.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Duration (minutes)</label>
          <input
            className="input"
            type="number"
            min={0}
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
          />
        </div>

        {/* Course trailer / intro video */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-theme bg-current/[0.02] p-5">
            <div className="mb-4 flex items-center gap-2">
              <VideoIcon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              <h3 className="text-sm font-semibold text-fg">
                Course intro video <span className="text-muted">(optional)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
              <div>
                <label className="label">Video URL</label>
                <input
                  className="input"
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=…  or  https://drive.google.com/file/d/…"
                />
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={trailerType}
                  onChange={(e) => setTrailerType(e.target.value)}
                  disabled={!trailerUrl.trim()}
                >
                  {TRAILER_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-muted">
              Shown at the top of the course&apos;s public page. Supports YouTube,
              Vimeo, Google Drive, Loom, Facebook, TikTok, and direct .mp4 URLs
              — the provider is auto-detected.
            </p>

            <CourseTrailerPreview url={trailerUrl} hint={trailerType} />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-theme bg-current/[0.02] p-4">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-purple"
            />
            <span>
              <span className="block text-sm text-fg">Publish to catalog</span>
              <span className="text-xs text-muted">
                Unpublished courses are hidden from visitors but still editable here.
              </span>
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-theme pt-6">
        <div>
          {initial?.id && (
            <button
              onClick={remove}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-2 text-sm text-rose-600 dark:text-rose-300 transition-colors hover:bg-rose-500/15 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete course
            </button>
          )}
        </div>
        <button
          onClick={submit}
          disabled={pending}
          className="btn-primary"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {initial?.id ? "Save changes" : "Create course"}
        </button>
      </div>
    </div>
  );
}

function CourseTrailerPreview({
  url,
  hint,
}: {
  url: string;
  hint: string;
}) {
  if (!url.trim()) return null;

  const resolved = resolveVideo(url, hint);

  if (!resolved) {
    return (
      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/[0.05] px-4 py-3">
        <p className="text-xs text-amber-700 dark:text-amber-200">
          Couldn&apos;t auto-detect the video provider. Try a different URL, or
          pick the right Type above.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-theme">
      <div className="relative aspect-video w-full bg-black">
        {resolved.kind === "iframe" ? (
          <iframe
            key={resolved.src}
            src={resolved.src}
            title="Course intro video preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            key={resolved.src}
            src={resolved.src}
            controls
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
      <div className="flex items-center justify-between border-t border-theme px-3 py-2 text-[11px] text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Detected: <span className="text-fg">{resolved.label}</span>
        </span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300"
        >
          Open original →
        </a>
      </div>
    </div>
  );
}
