import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  PlayCircle,
  BarChart3,
  Clock,
  CheckCircle2,
  Lightbulb,
  Pin,
  ListChecks,
  ClipboardList,
  Image as ImageIcon,
  Video as VideoIcon,
  File as FileIcon,
  Download,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/access";
import { Nav } from "@/components/public/Nav";
import { resolveVideo } from "@/lib/video";
import { formatDuration } from "@/lib/utils";
import { MarkCompleteButton } from "./MarkCompleteButton";
import { cn } from "@/lib/utils";

type Section = { title: string; body: string };

function parseJson<T>(s: string | null, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

// Resilient lesson load: if a newly-added column (e.g. `resources`) isn't
// migrated yet, the all-columns fetch throws — fall back to an explicit
// select that omits it so the lesson still renders.
async function loadLessonById(id: string) {
  try {
    return await prisma.lesson.findUnique({ where: { id } });
  } catch {
    return await prisma.lesson.findUnique({
      where: { id },
      select: {
        id: true,
        courseId: true,
        title: true,
        body: true,
        videoUrl: true,
        order: true,
        sections: true,
        takeaways: true,
        proTip: true,
        videoDuration: true,
        videoType: true,
        assignmentEnabled: true,
        assignmentTitle: true,
        assignmentDescription: true,
        assignmentFileTypes: true,
        published: true,
      },
    });
  }
}

const FILE_TYPE_META: Record<
  string,
  { label: string; Icon: typeof ImageIcon }
> = {
  images: { label: "Images", Icon: ImageIcon },
  videos: { label: "Videos", Icon: VideoIcon },
  pdfs: { label: "PDFs", Icon: FileIcon },
};

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // Admins can view any lesson regardless of approval status / enrollment.
  if (session.user.role !== "admin" && session.user.status !== "approved") {
    redirect("/pending");
  }

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      lessons: {
        // Learners only see published lessons, so progress %, the
        // certificate CTA, and the completion celebration must count
        // published lessons only (matching the dashboard, course page, and
        // certificate gate). Admins still see unpublished lessons here.
        where: session.user.role === "admin" ? undefined : { published: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          videoUrl: true,
        },
      },
    },
  });
  if (!course) notFound();

  const isAdmin = session.user.role === "admin";
  if (!isAdmin) {
    const hasAccess = await hasCourseAccess(session.user.id, course.id);
    if (!hasAccess) redirect("/pending");
  }

  const lesson = await loadLessonById(params.lessonId);
  if (!lesson || lesson.courseId !== course.id) notFound();

  const resources = parseJson<{ label: string; url: string }[]>(
    (lesson as { resources?: string | null }).resources ?? null,
    []
  );

  // Load completions for this user across this course's lessons
  const completions = await prisma.lessonCompletion.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: course.lessons.map((l) => l.id) },
    },
    select: { lessonId: true },
  });
  const completedSet = new Set(completions.map((c) => c.lessonId));
  const isCompleted = completedSet.has(lesson.id);

  const completedCount = completedSet.size;
  const totalCount = course.lessons.length;
  const progressPct =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const idx = course.lessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? course.lessons[idx - 1] : null;
  const next = idx < course.lessons.length - 1 ? course.lessons[idx + 1] : null;
  // Completing THIS lesson finishes the whole course (last one remaining).
  const completesCourse =
    !isCompleted && totalCount > 0 && completedCount === totalCount - 1;
  const nextHref = next
    ? `/courses/${course.slug}/lessons/${next.id}`
    : null;
  const certificateHref = `/courses/${course.slug}/certificate`;
  const video = lesson.videoUrl
    ? resolveVideo(lesson.videoUrl, lesson.videoType)
    : null;

  return (
    <>
      <Nav user={session.user} />
      <div className="px-6 pb-20 pt-28 sm:pt-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          {/* Sidebar — Marketing Intern Roadmap style */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <Link
                href={`/courses/${course.slug}`}
                className="mb-5 inline-flex items-center gap-2 text-xs text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to course
              </Link>

              <h2 className="text-lg font-semibold leading-tight tracking-tight text-fg">
                {course.title}
              </h2>

              <div className="mt-5">
                <div className="flex items-baseline justify-between text-[11px] text-muted">
                  <span>
                    <span className="text-fg font-medium">
                      {completedCount}
                    </span>{" "}
                    of {totalCount} lessons completed
                  </span>
                  <span className="text-purple-600 dark:text-purple-300">
                    {progressPct}%
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-current/10">
                  <div
                    className="h-full rounded-full bg-purple transition-[width] duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {!isAdmin && progressPct === 100 && totalCount > 0 && (
                <Link
                  href={`/courses/${course.slug}/certificate`}
                  className="mt-5 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-purple/10 p-3 transition-colors hover:from-amber-500/20"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
                    <Award className="h-4 w-4 text-amber-500 dark:text-amber-300" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-fg">
                      Course complete!
                    </span>
                    <span className="block text-[11px] text-amber-600 dark:text-amber-300">
                      Get your certificate →
                    </span>
                  </span>
                </Link>
              )}

              <div className="mt-7 border-t border-theme pt-5">
                <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
                  All lessons
                </div>
                <ul className="space-y-1 scrollbar-thin max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
                  {course.lessons.map((l, i) => {
                    const active = l.id === lesson.id;
                    const done = completedSet.has(l.id);
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/courses/${course.slug}/lessons/${l.id}`}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                            active
                              ? "bg-purple/15 text-fg [box-shadow:inset_3px_0_0_0_#7c3aed]"
                              : "text-muted hover:bg-purple/5 hover:text-fg"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors",
                              done
                                ? "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-300"
                                : active
                                ? "bg-purple text-white"
                                : "bg-current/10"
                            )}
                          >
                            {done ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : l.videoUrl ? (
                              <PlayCircle className="h-3.5 w-3.5" />
                            ) : (
                              <span className="text-[10px]">{i + 1}</span>
                            )}
                          </span>
                          <span className="flex-1 leading-snug">{l.title}</span>
                          {active && (
                            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main learning area */}
          <main className="min-w-0">
            {/* Mobile back link */}
            <Link
              href={`/courses/${course.slug}`}
              className="mb-4 inline-flex items-center gap-2 text-xs text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300 lg:hidden"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to course
            </Link>

            {/* Video / placeholder */}
            <div className="surface relative overflow-hidden rounded-2xl border border-theme">
              {video ? (
                <div className="relative aspect-video bg-black">
                  {video.kind === "iframe" ? (
                    <iframe
                      src={video.src}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  ) : (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video
                      src={video.src}
                      controls
                      className="absolute inset-0 h-full w-full"
                    />
                  )}
                </div>
              ) : (
                <div className="relative aspect-video bg-gradient-to-br from-purple-deep/30 to-ink-100/80">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-theme-strong bg-current/5 backdrop-blur-sm">
                      <PlayCircle className="h-7 w-7 text-muted" strokeWidth={1.2} />
                    </span>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
                      {lesson.videoUrl ? "Click to play" : "No video for this lesson"}
                    </p>
                  </div>
                </div>
              )}
              {video && (
                <div className="border-t border-theme px-4 py-2 text-[11px] text-muted">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {video.label}
                    {lesson.videoDuration && (
                      <>
                        <span className="text-current opacity-30">·</span>
                        <span>{lesson.videoDuration}</span>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>

            {!video && lesson.videoUrl && (
              <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-200">
                Could not embed the provided video URL.{" "}
                <a
                  className="underline"
                  href={lesson.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in new tab →
                </a>
              </div>
            )}

            {/* Title + metadata */}
            <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
                  Lesson {String(lesson.order).padStart(2, "0")}
                </p>
                <h1 className="mt-2 text-balance text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">
                  {lesson.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <BookmarkDot />
                    {course.title}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-purple-500 dark:text-purple-300" />
                    <span className="capitalize">{course.level}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-purple-500 dark:text-purple-300" />
                    {formatDuration(course.durationMin)}
                  </span>
                </div>
              </div>
              {!isAdmin && (
                <MarkCompleteButton
                  lessonId={lesson.id}
                  initialCompleted={isCompleted}
                  nextHref={nextHref}
                  completesCourse={completesCourse}
                  certificateHref={certificateHref}
                />
              )}
            </div>

            {/* Body */}
            {/* Structured sections (new) */}
            {(() => {
              const sections = parseJson<Section[]>(lesson.sections, []);
              const takeaways = parseJson<string[]>(lesson.takeaways, []);
              const fileTypes = parseJson<string[]>(
                lesson.assignmentFileTypes,
                []
              );
              const hasAnyStructured =
                sections.length > 0 ||
                takeaways.length > 0 ||
                !!lesson.proTip ||
                lesson.assignmentEnabled;

              return (
                <div className="mt-10 space-y-12">
                  {/* Sections */}
                  {sections.length > 0 ? (
                    <div className="space-y-10">
                      {sections.map((sec, i) => (
                        <section key={i}>
                          <div className="mb-4 flex items-center gap-3">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
                              {String(i + 1).padStart(2, "0")} —
                            </span>
                            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                              <Pin
                                className="h-4 w-4 -rotate-12 text-rose-500"
                                strokeWidth={2.5}
                              />
                              {sec.title.toUpperCase()}
                            </h2>
                          </div>
                          <article className="prose-koumi max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {sec.body || "*No content yet.*"}
                            </ReactMarkdown>
                          </article>
                        </section>
                      ))}
                    </div>
                  ) : lesson.body ? (
                    <article className="prose-koumi max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {lesson.body}
                      </ReactMarkdown>
                    </article>
                  ) : !hasAnyStructured ? (
                    <p className="surface rounded-lg border border-dashed border-theme-strong px-4 py-8 text-center text-muted">
                      This lesson has no written content yet.
                    </p>
                  ) : null}

                  {/* Key Takeaways */}
                  {takeaways.length > 0 && (
                    <section className="surface rounded-2xl border border-theme p-6 sm:p-8">
                      <div className="mb-5 flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                        <h3 className="text-lg font-semibold tracking-tight text-fg">
                          Key Takeaways
                        </h3>
                      </div>
                      <ul className="space-y-2.5">
                        {takeaways.map((t, i) => (
                          <li key={i} className="flex items-start gap-3 text-fg">
                            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple/15 text-[11px] font-medium text-purple-700 dark:text-purple-200">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Pro Tip */}
                  {lesson.proTip && (
                    <aside className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] to-purple/[0.06] p-6 sm:p-7">
                      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />
                      <div className="relative flex items-start gap-4">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
                          <Lightbulb
                            className="h-5 w-5 text-amber-500 dark:text-amber-300"
                            strokeWidth={2}
                          />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">
                            Pro Tip
                          </div>
                          <p className="mt-1.5 leading-relaxed text-fg">
                            {lesson.proTip}
                          </p>
                        </div>
                      </div>
                    </aside>
                  )}

                  {/* Assignment */}
                  {lesson.assignmentEnabled &&
                    (lesson.assignmentTitle ||
                      lesson.assignmentDescription) && (
                      <section className="surface rounded-2xl border-2 border-dashed border-purple-soft/40 p-6 sm:p-8">
                        <div className="mb-5 flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
                            Weekly assignment
                          </span>
                        </div>
                        {lesson.assignmentTitle && (
                          <h3 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                            {lesson.assignmentTitle}
                          </h3>
                        )}
                        {lesson.assignmentDescription && (
                          <div className="prose-koumi mt-3 max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {lesson.assignmentDescription}
                            </ReactMarkdown>
                          </div>
                        )}
                        {fileTypes.length > 0 && (
                          <div className="mt-5 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
                              Accepted:
                            </span>
                            {fileTypes.map((ft) => {
                              const meta = FILE_TYPE_META[ft];
                              if (!meta) return null;
                              const { label, Icon } = meta;
                              return (
                                <span
                                  key={ft}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-theme-strong bg-purple/[0.05] px-2.5 py-1 text-xs text-fg"
                                >
                                  <Icon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-300" />
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    )}
                </div>
              );
            })()}

            {/* Resources & downloads */}
            {resources.length > 0 && (
              <section className="mt-12">
                <div className="mb-4 flex items-center gap-2">
                  <FileIcon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  <h3 className="text-lg font-semibold tracking-tight text-fg">
                    Resources &amp; Downloads
                  </h3>
                </div>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {resources.map((r, i) => (
                    <li key={i}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="surface flex items-center gap-3 rounded-xl border border-theme p-3 transition-colors hover:border-purple-soft/40"
                      >
                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple/10 text-purple-600 dark:text-purple-300">
                          <FileIcon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-fg">
                          {r.label || r.url}
                        </span>
                        <Download className="h-4 w-4 flex-shrink-0 text-muted" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Prev/next nav */}
            <nav className="mt-16 grid grid-cols-1 gap-3 border-t border-theme pt-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${prev.id}`}
                  className="surface group flex items-center gap-3 rounded-xl border border-theme px-4 py-3 transition-colors hover:border-purple-soft/40"
                >
                  <ArrowLeft className="h-4 w-4 text-muted transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-200" />
                  <span className="text-left">
                    <span className="block text-[10px] uppercase tracking-wider text-muted">
                      Previous
                    </span>
                    <span className="line-clamp-1 text-sm text-fg">
                      {prev.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${next.id}`}
                  className="surface group flex items-center justify-end gap-3 rounded-xl border border-theme px-4 py-3 transition-colors hover:border-purple-soft/40 sm:col-start-2"
                >
                  <span className="text-right">
                    <span className="block text-[10px] uppercase tracking-wider text-muted">
                      Next
                    </span>
                    <span className="line-clamp-1 text-sm text-fg">
                      {next.title}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted transition-all group-hover:translate-x-1 group-hover:text-purple-600 dark:group-hover:text-purple-200" />
                </Link>
              ) : (
                <Link
                  href={`/courses/${course.slug}`}
                  className="btn-secondary justify-center text-xs sm:col-start-2"
                >
                  Back to course
                </Link>
              )}
            </nav>

            {isAdmin && (
              <div className="mt-8 rounded-lg border border-purple-soft/30 bg-purple/[0.05] px-4 py-3 text-xs text-purple-700 dark:text-purple-200">
                <strong>Admin view —</strong> "Mark as complete" is hidden for
                admins since progress is for learners. Open{" "}
                <Link
                  href={`/admin/courses`}
                  className="underline underline-offset-2"
                >
                  Admin → Courses
                </Link>{" "}
                to edit this lesson.
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

function BookmarkDot() {
  return (
    <span
      className="inline-flex h-3.5 w-3.5 items-center justify-center"
      aria-hidden
    >
      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 dark:bg-purple-300" />
    </span>
  );
}
