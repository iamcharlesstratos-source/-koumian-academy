import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Lock,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/public/Nav";
import { Footer } from "@/components/public/Footer";
import { formatDuration } from "@/lib/utils";
import { resolveVideo } from "@/lib/video";
import { CourseTabs } from "./CourseTabs";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  const isAdminUser = session?.user?.role === "admin";

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      lessons: {
        // Admins see unpublished lessons too (for review/editing in the public view);
        // everyone else only sees published lessons.
        where: isAdminUser ? undefined : { published: true },
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

  if (!course || (!course.published && !isAdminUser)) {
    notFound();
  }

  const enrolled = session?.user?.id
    ? !!(await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: course.id,
          },
        },
        select: { id: true },
      }))
    : false;

  const isApproved = session?.user?.status === "approved";
  const canAccess = isApproved && enrolled;
  const isAdmin = isAdminUser;

  // Pull completions for this user's lessons in this course
  let completedIds = new Set<string>();
  if (session?.user?.id) {
    const completions = await prisma.lessonCompletion.findMany({
      where: {
        userId: session.user.id,
        lessonId: { in: course.lessons.map((l) => l.id) },
      },
      select: { lessonId: true },
    });
    completedIds = new Set(completions.map((c) => c.lessonId));
  }

  const lessons = course.lessons.map((l) => ({
    ...l,
    completed: completedIds.has(l.id),
  }));

  const completedCount = lessons.filter((l) => l.completed).length;
  const totalCount = lessons.length;
  const progressPct =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <>
      <Nav user={session?.user ?? null} />
      <main className="px-6 pb-20 pt-32 sm:pt-40">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/courses"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>

          {course.coverImageUrl && (
            <div className="mb-10 overflow-hidden rounded-2xl border border-theme">
              <div className="relative aspect-[21/9] w-full bg-current/[0.03]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.coverImageUrl}
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="md:col-span-2">
              <span className="inline-flex items-center rounded-full border border-purple-soft/30 bg-purple/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-purple-700 dark:text-purple-200">
                {course.category}
              </span>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-fg sm:text-5xl">
                {course.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                {course.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500 dark:text-purple-300" />
                  <span className="capitalize">{course.level}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500 dark:text-purple-300" />
                  {formatDuration(course.durationMin)}
                </span>
                <span className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-purple-500 dark:text-purple-300" />
                  {totalCount} lesson{totalCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="surface sticky top-28 rounded-2xl border border-theme p-6 backdrop-blur-sm">
                {(canAccess || isAdmin) && totalCount > 0 ? (
                  <div className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
                    Your access
                  </div>
                ) : (
                  <div className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
                    Course access
                  </div>
                )}
                <div className="mb-6 text-2xl font-semibold tracking-tight text-fg">
                  {(canAccess || isAdmin) && totalCount > 0
                    ? "Lifetime"
                    : "Members only"}
                </div>

                {(canAccess || isAdmin) && totalCount > 0 && (
                  <div className="mb-5">
                    <div className="flex items-baseline justify-between text-xs text-muted">
                      <span>Your progress</span>
                      <span>
                        <span className="text-fg font-medium">
                          {completedCount}
                        </span>{" "}
                        / {totalCount}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-current/10">
                      <div
                        className="h-full rounded-full bg-purple transition-[width] duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-300">
                      {progressPct}% complete
                    </p>
                  </div>
                )}

                <AccessCTA
                  signedIn={!!session?.user}
                  isApproved={isApproved}
                  enrolled={enrolled}
                  isAdmin={isAdmin}
                  slug={course.slug}
                  firstLessonId={lessons[0]?.id}
                  hasProgress={completedCount > 0 && completedCount < totalCount}
                />
                <p className="mt-4 text-center text-xs text-muted">
                  {!session?.user
                    ? "Sign in to request access."
                    : !isApproved
                    ? "Your account is awaiting approval."
                    : enrolled
                    ? "You have lifetime access to this course."
                    : "Contact an admin to unlock this course."}
                </p>
              </div>
            </div>
          </div>

          {course.trailerUrl &&
            (() => {
              const trailer = resolveVideo(
                course.trailerUrl,
                course.trailerType
              );
              if (!trailer) return null;
              return (
                <section className="mt-14">
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
                    Course trailer
                  </p>
                  <div className="surface overflow-hidden rounded-2xl border border-theme">
                    <div className="relative aspect-video bg-black">
                      {trailer.kind === "iframe" ? (
                        <iframe
                          src={trailer.src}
                          title={`${course.title} — trailer`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full"
                        />
                      ) : (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video
                          src={trailer.src}
                          controls
                          className="absolute inset-0 h-full w-full"
                        />
                      )}
                    </div>
                    <div className="border-t border-theme px-4 py-2 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {trailer.label}
                      </span>
                    </div>
                  </div>
                </section>
              );
            })()}

          <CourseTabs
            slug={course.slug}
            description={course.description}
            lessons={lessons}
            canAccess={canAccess}
            isAdmin={isAdmin}
          />

          {isAdmin && (
            <div className="mt-10 flex justify-end">
              <Link
                href={`/admin/courses/${course.id}`}
                className="btn-secondary text-xs"
              >
                Edit in admin
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer signedIn={!!session?.user} />
    </>
  );
}

function AccessCTA({
  signedIn,
  isApproved,
  enrolled,
  isAdmin,
  slug,
  firstLessonId,
  hasProgress,
}: {
  signedIn: boolean;
  isApproved: boolean;
  enrolled: boolean;
  isAdmin: boolean;
  slug: string;
  firstLessonId?: string;
  hasProgress: boolean;
}) {
  if (!signedIn) {
    return (
      <Link href="/login" className="btn-primary w-full justify-center">
        Sign in to continue
      </Link>
    );
  }
  if (isAdmin && firstLessonId) {
    return (
      <Link
        href={`/courses/${slug}/lessons/${firstLessonId}`}
        className="btn-primary w-full justify-center"
      >
        <CheckCircle2 className="h-4 w-4" />
        Open as admin
      </Link>
    );
  }
  if (!isApproved) {
    return (
      <Link href="/pending" className="btn-secondary w-full justify-center">
        Awaiting approval
      </Link>
    );
  }
  if (enrolled && firstLessonId) {
    return (
      <Link
        href={`/courses/${slug}/lessons/${firstLessonId}`}
        className="btn-primary w-full justify-center"
      >
        <PlayCircle className="h-4 w-4" />
        {hasProgress ? "Continue learning" : "Start learning"}
      </Link>
    );
  }
  return (
    <button
      disabled
      className="btn-secondary w-full cursor-not-allowed justify-center opacity-60"
    >
      <Lock className="h-4 w-4" />
      Locked
    </button>
  );
}
