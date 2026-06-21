"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Save,
  Eye,
  X,
  Loader2,
  ChevronUp,
  ChevronDown,
  Trash2,
  Video as VideoIcon,
  ListChecks,
  Lightbulb,
  ClipboardList,
  Image as ImageIcon,
  File as FileIcon,
  GraduationCap,
  Settings as SettingsIcon,
  Pin,
  Circle,
  CheckCircle2,
  PlayCircle,
  Pencil,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  moveLessonUp,
  moveLessonDown,
  publishAllLessons,
  type LessonSection,
  type LessonResource,
} from "@/app/admin/courses/actions";
import { CourseForm } from "@/components/admin/CourseForm";
import { resolveVideo } from "@/lib/video";

// ─────────── Types ───────────

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  durationMin: number;
  priceCents: number;
  published: boolean;
  coverImageUrl?: string | null;
  trailerUrl?: string | null;
  trailerType?: string | null;
};

type RawLesson = {
  id: string;
  title: string;
  body: string;
  order: number;
  videoUrl: string | null;
  videoType: string | null;
  videoDuration: string | null;
  sections: string | null;
  takeaways: string | null;
  proTip: string | null;
  published: boolean;
  assignmentEnabled: boolean;
  assignmentTitle: string | null;
  assignmentDescription: string | null;
  assignmentFileTypes: string | null;
  resources: string | null;
};

type EditorLesson = {
  id: string;
  order: number;
  title: string;
  body: string;
  videoUrl: string;
  videoType: string;
  videoDuration: string;
  sections: LessonSection[];
  takeaways: string[];
  proTip: string;
  published: boolean;
  assignmentEnabled: boolean;
  assignmentTitle: string;
  assignmentDescription: string;
  assignmentFileTypes: string[];
  resources: LessonResource[];
};

const VIDEO_TYPES = [
  { id: "auto", label: "Auto-detect" },
  { id: "youtube", label: "YouTube" },
  { id: "vimeo", label: "Vimeo" },
  { id: "googleDrive", label: "Google Drive" },
  { id: "loom", label: "Loom" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "mp4", label: "Direct .mp4" },
];
const FILE_TYPES = [
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "videos", label: "Videos", icon: VideoIcon },
  { id: "pdfs", label: "PDFs", icon: FileIcon },
];

function parseJson<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

// Run a lesson server action, surfacing any failure as a toast instead of an
// unhandled rejection. These mutations don't redirect, so there's no
// NEXT_REDIRECT to filter (unlike the course create/delete actions).
async function runAction(fn: () => Promise<unknown>, fallback: string) {
  try {
    return await fn();
  } catch (e) {
    toast.error(e instanceof Error ? e.message : fallback);
    return undefined;
  }
}

function toEditorLesson(l: RawLesson): EditorLesson {
  return {
    id: l.id,
    order: l.order,
    title: l.title,
    body: l.body ?? "",
    videoUrl: l.videoUrl ?? "",
    videoType: l.videoType ?? "auto",
    videoDuration: l.videoDuration ?? "",
    sections: parseJson<LessonSection[]>(l.sections, []),
    takeaways: parseJson<string[]>(l.takeaways, []),
    proTip: l.proTip ?? "",
    published: l.published,
    assignmentEnabled: l.assignmentEnabled,
    assignmentTitle: l.assignmentTitle ?? "",
    assignmentDescription: l.assignmentDescription ?? "",
    assignmentFileTypes: parseJson<string[]>(l.assignmentFileTypes, [
      "images",
      "videos",
      "pdfs",
    ]),
    resources: parseJson<LessonResource[]>(l.resources, []),
  };
}

// ─────────── Top-level Component ───────────

export function CourseEditor({
  course,
  lessons,
}: {
  course: Course;
  lessons: RawLesson[];
}) {
  const [tab, setTab] = useState<"lessons" | "settings">("lessons");

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            Edit course
          </p>
          <h1 className="truncate text-3xl font-semibold tracking-tight text-fg">
            {course.title}
          </h1>
        </div>
        <Link
          href={`/courses/${course.slug}`}
          target="_blank"
          className="btn-secondary text-xs"
        >
          <Eye className="h-3.5 w-3.5" />
          View public page
        </Link>
      </header>

      {/* Tab bar */}
      <div className="mb-6 flex items-center gap-2 rounded-2xl border border-theme surface p-2 backdrop-blur-sm">
        <TabButton
          active={tab === "lessons"}
          onClick={() => setTab("lessons")}
          icon={GraduationCap}
        >
          Lesson Editor
        </TabButton>
        <TabButton
          active={tab === "settings"}
          onClick={() => setTab("settings")}
          icon={SettingsIcon}
        >
          Course Settings
        </TabButton>
      </div>

      {tab === "lessons" ? (
        <LessonEditorPane
          course={course}
          courseSlug={course.slug}
          lessons={lessons}
        />
      ) : (
        <div>
          <CourseForm
            initial={{
              id: course.id,
              title: course.title,
              slug: course.slug,
              description: course.description,
              category: course.category,
              level: course.level,
              durationMin: course.durationMin,
              priceCents: course.priceCents,
              published: course.published,
              coverImageUrl: course.coverImageUrl ?? null,
              trailerUrl: course.trailerUrl ?? null,
              trailerType: course.trailerType ?? null,
            }}
          />
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof GraduationCap;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-purple text-white shadow-[0_0_25px_rgba(124,58,237,0.35)]"
          : "text-muted hover:bg-current/[0.05] hover:text-fg"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

// ─────────── Lesson Editor Pane ───────────

function LessonEditorPane({
  course,
  courseSlug,
  lessons,
}: {
  course: Course;
  courseSlug: string;
  lessons: RawLesson[];
}) {
  const editorLessons = useMemo(
    () => lessons.map(toEditorLesson),
    [lessons]
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    editorLessons[0]?.id ?? null
  );

  // Keep selection valid when lessons array changes (after server actions)
  useEffect(() => {
    if (selectedId && editorLessons.some((l) => l.id === selectedId)) return;
    setSelectedId(editorLessons[0]?.id ?? null);
  }, [editorLessons, selectedId]);

  const selected = editorLessons.find((l) => l.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <CurriculumSidebar
        courseId={course.id}
        lessons={editorLessons}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {selected ? (
        <LessonFormPanel
          key={selected.id}
          courseTitle={course.title}
          courseSlug={courseSlug}
          lesson={selected}
          total={editorLessons.length}
        />
      ) : (
        <div className="surface flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-theme-strong p-10 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
            <Layers className="h-6 w-6 text-purple-600 dark:text-purple-300" />
          </span>
          <h3 className="text-xl font-semibold text-fg">No lessons yet</h3>
          <p className="mt-2 max-w-sm text-balance text-sm text-muted">
            Add your first lesson from the sidebar to start building this
            course&apos;s curriculum.
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────── Sidebar ───────────

function CurriculumSidebar({
  courseId,
  lessons,
  selectedId,
  onSelect,
}: {
  courseId: string;
  lessons: EditorLesson[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [addPending, startAdd] = useTransition();
  const [publishAllPending, startPublishAll] = useTransition();

  const handleAdd = () => {
    startAdd(async () => {
      const newId = await runAction(
        () =>
          createLesson(courseId, {
            title: `Lesson ${lessons.length + 1}`,
            body: "",
            published: true,
          }),
        "Failed to add lesson"
      );
      if (typeof newId === "string") {
        onSelect(newId);
        toast.success("Lesson added.");
      }
    });
  };

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-2xl border border-theme surface p-5 backdrop-blur-sm">
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
          Curriculum
        </div>
        <div className="text-xs text-muted">
          {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
        </div>

        <button
          onClick={() =>
            startPublishAll(async () => {
              await runAction(
                () => publishAllLessons(courseId),
                "Failed to publish lessons"
              );
            })
          }
          disabled={publishAllPending || lessons.length === 0}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-theme-strong bg-current/[0.04] px-3 py-2 text-xs text-fg transition-colors hover:bg-current/[0.07] disabled:opacity-40"
        >
          {publishAllPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          Publish all lessons
        </button>

        <button
          onClick={handleAdd}
          disabled={addPending}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-purple-soft/30 bg-purple/10 px-3 py-2 text-xs font-medium text-purple-700 dark:text-purple-200 transition-colors hover:bg-purple/20 disabled:opacity-40"
        >
          {addPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Add lesson
        </button>

        <div className="my-4 h-px bg-current/10" />

        <ul className="space-y-1 max-h-[calc(100vh-360px)] overflow-y-auto pr-1 scrollbar-thin">
          {lessons.length === 0 ? (
            <li className="rounded-lg border border-dashed border-theme-strong px-3 py-6 text-center text-[11px] text-muted">
              Build the curriculum lesson by lesson.
            </li>
          ) : (
            lessons.map((l, i) => (
              <LessonSidebarItem
                key={l.id}
                lesson={l}
                index={i}
                isFirst={i === 0}
                isLast={i === lessons.length - 1}
                active={l.id === selectedId}
                onSelect={() => onSelect(l.id)}
              />
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}

function LessonSidebarItem({
  lesson,
  index,
  isFirst,
  isLast,
  active,
  onSelect,
}: {
  lesson: EditorLesson;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  active: boolean;
  onSelect: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <li
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
        active
          ? "bg-purple/15 [box-shadow:inset_3px_0_0_0_#7c3aed]"
          : "hover:bg-current/[0.05]"
      )}
    >
      <button
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <Circle
          className={cn(
            "h-2 w-2 flex-shrink-0 transition-colors",
            active
              ? "fill-purple-300 text-purple-600 dark:text-purple-300"
              : "fill-current/20 text-current/20"
          )}
        />
        <span
          className={cn(
            "min-w-0 truncate text-xs",
            active ? "text-fg" : "text-muted group-hover:text-fg"
          )}
        >
          W{index + 1}: {lesson.title}
        </span>
      </button>

      <div className="flex flex-shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
        <button
          disabled={pending || isFirst}
          onClick={() =>
            start(async () => {
              await runAction(() => moveLessonUp(lesson.id), "Failed to reorder lesson");
            })
          }
          className="rounded p-0.5 text-muted transition-colors hover:bg-current/[0.06] hover:text-fg disabled:opacity-25"
          title="Move up"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          disabled={pending || isLast}
          onClick={() =>
            start(async () => {
              await runAction(() => moveLessonDown(lesson.id), "Failed to reorder lesson");
            })
          }
          className="rounded p-0.5 text-muted transition-colors hover:bg-current/[0.06] hover:text-fg disabled:opacity-25"
          title="Move down"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (!confirm(`Delete "${lesson.title}"?`)) return;
            start(async () => {
              await runAction(() => deleteLesson(lesson.id), "Failed to delete lesson");
            });
          }}
          className="rounded p-0.5 text-rose-400 transition-colors hover:bg-rose-500/15 disabled:opacity-25"
          title="Delete"
        >
          {pending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </button>
      </div>
    </li>
  );
}

// ─────────── Lesson Form Panel ───────────

function LessonFormPanel({
  courseTitle,
  courseSlug,
  lesson,
  total,
}: {
  courseTitle: string;
  courseSlug: string;
  lesson: EditorLesson;
  total: number;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl);
  const [videoType, setVideoType] = useState(lesson.videoType);
  const [videoDuration, setVideoDuration] = useState(lesson.videoDuration);
  const [published, setPublished] = useState(lesson.published);
  const [sections, setSections] = useState<LessonSection[]>(
    lesson.sections.length > 0
      ? lesson.sections
      : lesson.body
      ? [{ title: "Section 1", body: lesson.body }]
      : []
  );
  const [takeaways, setTakeaways] = useState<string[]>(lesson.takeaways);
  const [proTip, setProTip] = useState(lesson.proTip);
  const [assignmentEnabled, setAssignmentEnabled] = useState(
    lesson.assignmentEnabled
  );
  const [assignmentTitle, setAssignmentTitle] = useState(lesson.assignmentTitle);
  const [assignmentDescription, setAssignmentDescription] = useState(
    lesson.assignmentDescription
  );
  const [assignmentFileTypes, setAssignmentFileTypes] = useState<string[]>(
    lesson.assignmentFileTypes
  );
  const [resources, setResources] = useState<LessonResource[]>(
    lesson.resources
  );

  const [pending, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const save = () => {
    setError(null);
    startSave(async () => {
      try {
        // Combine sections into the legacy body for backward compatibility
        const combinedBody =
          sections.length > 0
            ? sections
                .map((s) => `## ${s.title}\n\n${s.body}`.trim())
                .join("\n\n---\n\n")
            : "";
        await updateLesson(lesson.id, {
          title,
          body: combinedBody,
          videoUrl,
          videoType,
          videoDuration,
          sections,
          takeaways,
          proTip,
          published,
          assignmentEnabled,
          assignmentTitle,
          assignmentDescription,
          assignmentFileTypes,
          resources: resources.filter((r) => r.url.trim() || r.label.trim()),
        });
        setSavedAt(new Date().toLocaleTimeString());
        toast.success("Lesson saved.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to save";
        setError(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Sticky header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-theme surface px-5 py-3 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple/10 text-sm font-medium text-purple-700 dark:text-purple-200">
            {lesson.order}
          </span>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
              Lesson {lesson.order} of {total}
            </div>
            <div className="truncate text-sm text-fg">{courseTitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && !pending && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-300">
              Saved at {savedAt}
            </span>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-theme-strong bg-current/[0.02] px-3 py-2 text-xs text-fg transition-colors hover:bg-current/[0.07]"
            onClick={() =>
              window.open(
                `/courses/${courseSlug}/lessons/${lesson.id}`,
                "_blank"
              )
            }
            title="Open the public lesson preview"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            onClick={save}
            disabled={pending}
            className="btn-primary text-xs"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Lesson
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Lesson Details */}
      <Panel icon={Pencil} title="Lesson Details">
        <div className="space-y-5">
          <div>
            <label className="label">Lesson Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Branding"
            />
          </div>

          <div>
            <label className="label">Order</label>
            <div className="input flex items-center justify-between">
              <span>Position {lesson.order}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted">
                use ↑/↓ in sidebar
              </span>
            </div>
          </div>

          <Toggle
            label="Published"
            subtext="Students can view this lesson when published."
            checked={published}
            onChange={setPublished}
          />
        </div>
      </Panel>

      {/* Video */}
      <Panel icon={VideoIcon} title="Video">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px_120px]">
            <div>
              <label className="label">Video URL</label>
              <input
                className="input"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={videoType}
                onChange={(e) => setVideoType(e.target.value)}
              >
                {VIDEO_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Duration</label>
              <input
                className="input"
                value={videoDuration}
                onChange={(e) => setVideoDuration(e.target.value)}
                placeholder="14:50"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted">
            Supports: YouTube • Vimeo • Google Drive • Facebook Video • Loom •
            TikTok • Direct .mp4 URL. Just paste — the provider is auto-detected.
          </p>
          <VideoPreview url={videoUrl} hint={videoType} />
        </div>
      </Panel>

      {/* Lesson Content sections */}
      <Panel
        icon={Pencil}
        title="Lesson Content"
        action={
          <button
            onClick={() =>
              setSections((arr) => [
                ...arr,
                {
                  title: `Section ${arr.length + 1}`,
                  body: "",
                },
              ])
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-theme-strong bg-current/[0.04] px-3 py-1.5 text-xs text-fg transition-colors hover:bg-current/[0.07]"
          >
            <Plus className="h-3 w-3" />
            Add Section
          </button>
        }
      >
        {sections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-theme-strong px-4 py-10 text-center text-xs text-muted">
            No sections yet. Click <strong>Add Section</strong> to start writing.
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((s, i) => (
              <SectionEditor
                key={i}
                index={i}
                section={s}
                onChange={(next) =>
                  setSections((arr) =>
                    arr.map((x, idx) => (idx === i ? next : x))
                  )
                }
                onRemove={() =>
                  setSections((arr) => arr.filter((_, idx) => idx !== i))
                }
              />
            ))}
          </div>
        )}
      </Panel>

      {/* Key Takeaways */}
      <Panel
        icon={ListChecks}
        title="Key Takeaways"
        action={
          <button
            onClick={() => setTakeaways((arr) => [...arr, ""])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-theme-strong bg-current/[0.04] px-3 py-1.5 text-xs text-fg transition-colors hover:bg-current/[0.07]"
          >
            <Plus className="h-3 w-3" />
            Add Point
          </button>
        }
      >
        {takeaways.length === 0 ? (
          <div className="rounded-lg border border-dashed border-theme-strong px-4 py-8 text-center text-xs text-muted">
            No takeaways added.
          </div>
        ) : (
          <ul className="space-y-2">
            {takeaways.map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple/10 text-[10px] text-purple-700 dark:text-purple-200">
                  {i + 1}
                </span>
                <input
                  className="input"
                  value={t}
                  onChange={(e) =>
                    setTakeaways((arr) =>
                      arr.map((x, idx) => (idx === i ? e.target.value : x))
                    )
                  }
                  placeholder="One sentence the learner should remember."
                />
                <button
                  onClick={() =>
                    setTakeaways((arr) => arr.filter((_, idx) => idx !== i))
                  }
                  className="rounded-lg border border-theme-strong bg-current/[0.02] p-2 text-muted transition-colors hover:bg-current/[0.07] hover:text-fg"
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Pro Tip */}
      <Panel icon={Lightbulb} title="Pro Tip">
        <textarea
          className="input min-h-[100px] resize-y leading-relaxed"
          value={proTip}
          onChange={(e) => setProTip(e.target.value)}
          placeholder="Add a pro tip for this lesson (shown in a highlighted box)…"
        />
      </Panel>

      {/* Resources & Downloads */}
      <Panel
        icon={FileIcon}
        title="Resources & Downloads"
        action={
          <button
            onClick={() =>
              setResources((arr) => [...arr, { label: "", url: "" }])
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-theme-strong bg-current/[0.04] px-3 py-1.5 text-xs text-fg transition-colors hover:bg-current/[0.07]"
          >
            <Plus className="h-3 w-3" />
            Add Resource
          </button>
        }
      >
        {resources.length === 0 ? (
          <div className="rounded-lg border border-dashed border-theme-strong px-4 py-8 text-center text-xs text-muted">
            No resources. Add downloadable links (PDFs, worksheets, templates).
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((r, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <input
                  className="input sm:max-w-[42%]"
                  value={r.label}
                  onChange={(e) =>
                    setResources((arr) =>
                      arr.map((x, idx) =>
                        idx === i ? { ...x, label: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Label (e.g. Worksheet PDF)"
                />
                <input
                  className="input flex-1"
                  value={r.url}
                  onChange={(e) =>
                    setResources((arr) =>
                      arr.map((x, idx) =>
                        idx === i ? { ...x, url: e.target.value } : x
                      )
                    )
                  }
                  placeholder="https://… (link to the file)"
                />
                <button
                  onClick={() =>
                    setResources((arr) => arr.filter((_, idx) => idx !== i))
                  }
                  className="self-end rounded-lg border border-theme-strong bg-current/[0.02] p-2 text-muted transition-colors hover:bg-current/[0.07] hover:text-fg sm:self-auto"
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Weekly Assignment */}
      <Panel
        icon={ClipboardList}
        title="Weekly Assignment"
        action={
          <Toggle
            label=""
            checked={assignmentEnabled}
            onChange={setAssignmentEnabled}
            compact
          />
        }
      >
        <div
          className={cn(
            "space-y-4 transition-opacity",
            !assignmentEnabled && "pointer-events-none opacity-40"
          )}
        >
          <div>
            <label className="label">Assignment Title</label>
            <input
              className="input"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              placeholder="📌 NOW IT'S YOUR TURN"
            />
          </div>
          <div>
            <label className="label">Assignment Description</label>
            <textarea
              className="input min-h-[100px] resize-y leading-relaxed"
              value={assignmentDescription}
              onChange={(e) => setAssignmentDescription(e.target.value)}
              placeholder="Walk the learner through what they need to do."
            />
          </div>
          <div>
            <label className="label">Accepted File Types</label>
            <div className="flex flex-wrap gap-2">
              {FILE_TYPES.map((f) => {
                const checked = assignmentFileTypes.includes(f.id);
                return (
                  <label
                    key={f.id}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                      checked
                        ? "border-purple-soft/40 bg-purple/15 text-purple-800 dark:text-purple-100"
                        : "border-theme-strong bg-current/[0.02] text-muted hover:bg-current/[0.06]"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="accent-purple-500"
                      checked={checked}
                      onChange={(e) =>
                        setAssignmentFileTypes((arr) =>
                          e.target.checked
                            ? Array.from(new Set([...arr, f.id]))
                            : arr.filter((x) => x !== f.id)
                        )
                      }
                    />
                    <f.icon className="h-3.5 w-3.5" />
                    {f.label}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Panel>

      {/* Footer save bar (mirror at the bottom) */}
      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl border border-theme surface px-5 py-3 backdrop-blur-xl">
        <button onClick={save} disabled={pending} className="btn-primary text-xs">
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save Lesson
        </button>
      </div>
    </div>
  );
}

// ─────────── Sub-components ───────────

function Panel({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof Pin;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-theme surface p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
          <Icon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function SectionEditor({
  index,
  section,
  onChange,
  onRemove,
}: {
  index: number;
  section: LessonSection;
  onChange: (s: LessonSection) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-theme bg-current/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          Section {index + 1}
        </div>
        <button
          onClick={onRemove}
          className="rounded-lg border border-theme-strong bg-current/[0.02] p-1.5 text-muted transition-colors hover:bg-rose-500/15 hover:text-rose-700 dark:hover:text-rose-200"
          title="Remove section"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="relative">
          <Pin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-rose-400" />
          <input
            className="input pl-9"
            value={section.title}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
            placeholder="SECTION HEADING (e.g. WHAT IS E-COMMERCE?)"
          />
        </div>
        <textarea
          className="input min-h-[140px] resize-y leading-relaxed"
          value={section.body}
          onChange={(e) => onChange({ ...section, body: e.target.value })}
          placeholder="Write the section body…  Supports markdown."
        />
      </div>
    </div>
  );
}

function VideoPreview({
  url,
  hint,
}: {
  url: string;
  hint: string;
}) {
  if (!url.trim()) {
    return (
      <div className="rounded-xl border border-dashed border-theme-strong bg-current/[0.02] p-3">
        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-gradient-to-br from-purple-deep/20 to-ink-100/60">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-theme-strong bg-current/[0.04]">
              <PlayCircle
                className="h-5 w-5 text-muted"
                strokeWidth={1.2}
              />
            </span>
            <p className="mt-3 text-[11px] text-muted">
              Paste a video URL to see the preview here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const resolved = resolveVideo(url, hint);

  if (!resolved) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-3">
        <div className="flex items-start gap-3 px-3 py-2">
          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15">
            <PlayCircle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-200">
              Couldn&apos;t auto-detect provider
            </p>
            <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-200/80">
              Pick the right Type in the dropdown, or paste a supported URL
              (YouTube, Vimeo, Google Drive, Loom, Facebook, TikTok, or direct
              .mp4).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-theme-strong bg-current/[0.03] p-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        {resolved.kind === "iframe" ? (
          <iframe
            key={resolved.src}
            src={resolved.src}
            title="Video preview"
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
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Detected: <span className="text-fg">{resolved.label}</span>
        </span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-purple-600 dark:text-purple-300 hover:opacity-80"
        >
          Open original →
        </a>
      </div>
    </div>
  );
}

function Toggle({
  label,
  subtext,
  checked,
  onChange,
  compact = false,
}: {
  label: string;
  subtext?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", compact && "gap-2")}>
      {label && (
        <div>
          <div className="text-sm font-medium text-fg">{label}</div>
          {subtext && <div className="text-[11px] text-muted">{subtext}</div>}
        </div>
      )}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-purple" : "bg-current/15"
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
