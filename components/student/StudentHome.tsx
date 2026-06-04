"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Newspaper,
  Trophy,
  Clock,
  PlayCircle,
  CheckCircle2,
  Calendar,
  LayoutDashboard,
  User as UserIcon,
  Compass,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type StudentCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  durationMin: number;
  firstLessonId?: string;
  totalLessons: number;
  completedLessons: number;
};

type Props = {
  name: string;
  status: string;
  role: string;
  memberSince: string;
  enrolledCourses: StudentCourse[];
  latestCourses: StudentCourse[];
  totals: {
    enrolledCount: number;
    completedLessons: number;
    totalLessons: number;
    catalogCount: number;
  };
};

export function StudentHome({
  name,
  status,
  role,
  memberSince,
  enrolledCourses,
  latestCourses,
  totals,
}: Props) {
  const firstName = name.split(" ")[0] ?? "there";
  const isPending = status === "pending";
  const isRejected = status === "rejected";
  const isAdmin = role === "admin";

  const inProgress = enrolledCourses.filter(
    (c) => c.completedLessons > 0 && c.completedLessons < c.totalLessons
  );
  const notStarted = enrolledCourses.filter((c) => c.completedLessons === 0);
  const finished = enrolledCourses.filter(
    (c) => c.totalLessons > 0 && c.completedLessons === c.totalLessons
  );

  // Pick the most relevant resume CTA
  const resume = inProgress[0] ?? notStarted[0];

  return (
    <div className="px-4 pb-24 pt-6 sm:px-6 lg:pb-12 lg:pt-2">
      <div className="mx-auto max-w-7xl">
        {/* Welcome */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="surface relative overflow-hidden rounded-3xl border border-theme p-6 sm:p-10"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-purple-deep/20 blur-3xl" />

          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
                Welcome back
              </p>
              <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-5xl">
                Hello, <span className="word-violet">{firstName}.</span>
              </h1>
              <p className="mt-4 max-w-xl text-muted">
                {isPending
                  ? "Your account is awaiting an admin's approval. You can browse the catalog while you wait."
                  : isRejected
                  ? "Your account wasn't approved. Reach out to the Koumian Academy team if you think this is a mistake."
                  : enrolledCourses.length === 0
                  ? "You're approved. An admin will grant you access to specific courses — once unlocked, they appear here."
                  : "Pick up where you left off or browse new programs in the catalog."}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                {isAdmin && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-soft/30 bg-purple/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-purple-700 dark:text-purple-200">
                    <LayoutDashboard className="h-3 w-3" />
                    Administrator
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-theme-strong nav-bg px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                  <Calendar className="h-3 w-3" />
                  Member since {memberSince}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {resume && resume.firstLessonId ? (
                <Link
                  href={`/courses/${resume.slug}/lessons/${resume.firstLessonId}`}
                  className="btn-primary"
                >
                  <PlayCircle className="h-4 w-4" />
                  Continue learning
                </Link>
              ) : (
                <Link href="/courses" className="btn-primary">
                  <Compass className="h-4 w-4" />
                  Browse the catalog
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="btn-secondary">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>
        </motion.section>

        {/* Stats strip */}
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={BookOpen}
            tone="indigo"
            label="Courses unlocked"
            value={String(totals.enrolledCount)}
            sub={`of ${totals.catalogCount} in catalog`}
          />
          <StatCard
            icon={CheckCircle2}
            tone="emerald"
            label="Lessons completed"
            value={String(totals.completedLessons)}
            sub={`of ${totals.totalLessons} total`}
          />
          <StatCard
            icon={Clock}
            tone="amber"
            label="In progress"
            value={String(inProgress.length)}
            sub={inProgress.length === 1 ? "course" : "courses"}
          />
          <StatCard
            icon={Trophy}
            tone="sky"
            label="Finished"
            value={String(finished.length)}
            sub={finished.length === 1 ? "course" : "courses"}
          />
        </section>

        {/* Continue learning */}
        <section className="mt-12">
          <SectionHeader
            eyebrow="My learning"
            title="Continue where you left off"
            cta={
              enrolledCourses.length > 0
                ? { label: "View profile →", href: "/profile" }
                : undefined
            }
          />

          {enrolledCourses.length === 0 ? (
            <EmptyLearning isPending={isPending} isRejected={isRejected} />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {enrolledCourses.map((c, i) => (
                <EnrolledCourseCard course={c} index={i} key={c.id} />
              ))}
            </div>
          )}
        </section>

        {/* Discover */}
        {latestCourses.length > 0 && (
          <section className="mt-16">
            <SectionHeader
              eyebrow="The catalog"
              title="New in the library"
              cta={{ label: "Browse all courses →", href: "/courses" }}
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {latestCourses.map((c, i) => (
                <DiscoverCourseCard course={c} index={i} key={c.id} />
              ))}
            </div>
          </section>
        )}

        {/* Quick actions footer */}
        <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ActionCard
            href="/courses"
            icon={Compass}
            title="Browse catalog"
            body="See every program in the library."
          />
          <ActionCard
            href="/profile"
            icon={UserIcon}
            title="My profile"
            body="Manage account and review progress."
          />
          {isAdmin ? (
            <ActionCard
              href="/admin"
              icon={LayoutDashboard}
              title="Admin dashboard"
              body="Approve members and manage courses."
              accent
            />
          ) : (
            <ActionCard
              href="/community"
              icon={Newspaper}
              title="Community feed"
              body="Share wins and connect with members."
            />
          )}
        </section>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string;
  title: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          {title}
        </h2>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="text-xs text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

const STAT_TONES: Record<string, { tile: string; icon: string }> = {
  indigo: { tile: "bg-purple/10", icon: "text-purple-600 dark:text-purple-300" },
  emerald: {
    tile: "bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-300",
  },
  amber: { tile: "bg-amber-500/10", icon: "text-amber-600 dark:text-amber-300" },
  sky: { tile: "bg-sky-500/10", icon: "text-sky-600 dark:text-sky-300" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "indigo",
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  sub: string;
  tone?: "indigo" | "emerald" | "amber" | "sky";
}) {
  const t = STAT_TONES[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="surface rounded-2xl border border-theme p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-fg">
            {value}
          </div>
          <div className="mt-0.5 text-[11px] text-muted">{sub}</div>
        </div>
        <span
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${t.tile}`}
        >
          <Icon className={`h-4 w-4 ${t.icon}`} />
        </span>
      </div>
    </motion.div>
  );
}

function EnrolledCourseCard({
  course,
  index,
}: {
  course: StudentCourse;
  index: number;
}) {
  const pct =
    course.totalLessons === 0
      ? 0
      : Math.round((course.completedLessons / course.totalLessons) * 100);
  const isFinished =
    course.totalLessons > 0 && course.completedLessons === course.totalLessons;

  const accents = [
    "from-purple-700 to-purple-500",
    "from-violet-700 to-fuchsia-500",
    "from-purple-600 to-indigo-500",
  ];
  const accent = accents[index % accents.length];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
    >
      <Link
        href={
          course.firstLessonId
            ? `/courses/${course.slug}/lessons/${course.firstLessonId}`
            : `/courses/${course.slug}`
        }
        className="group block"
      >
        <div
          onMouseMove={handleMouseMove}
          className="card-glow surface flex h-full flex-col overflow-hidden rounded-2xl border border-theme transition-all hover:border-purple-soft/40"
        >
          <div
            className={cn(
              "relative h-28 bg-gradient-to-br",
              accent
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute left-5 top-5">
              <span className="inline-flex items-center rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                {course.category}
              </span>
            </div>
            {isFinished && (
              <div className="absolute right-5 top-5">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white shadow-lg">
                  <Trophy className="h-3 w-3" />
                  Finished
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col p-6">
            <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-fg transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-100">
              {course.title}
            </h3>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              <span className="capitalize">{course.level}</span>
              <span>·</span>
              <span>{formatDuration(course.durationMin)}</span>
              <span>·</span>
              <span>
                {course.totalLessons} lesson
                {course.totalLessons === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-5">
              <div className="flex items-baseline justify-between text-[11px] text-muted">
                <span>
                  <span className="text-fg font-medium">
                    {course.completedLessons}
                  </span>{" "}
                  / {course.totalLessons} complete
                </span>
                <span className="text-purple-600 dark:text-purple-300">
                  {pct}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-current/10">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500",
                    isFinished ? "bg-emerald-500" : "bg-purple"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-theme pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-purple-600 transition-transform group-hover:translate-x-1 dark:text-purple-300">
                {isFinished
                  ? "Review course"
                  : course.completedLessons === 0
                  ? "Start course"
                  : "Continue"}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted">
                Lifetime access
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function DiscoverCourseCard({
  course,
  index,
}: {
  course: StudentCourse;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
    >
      <Link href={`/courses/${course.slug}`} className="group block">
        <div className="surface flex h-full flex-col rounded-2xl border border-theme p-6 transition-all hover:border-purple-soft/40">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full border border-purple-soft/30 bg-purple/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-purple-700 dark:text-purple-200">
              {course.category}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted">
              {course.totalLessons} lesson
              {course.totalLessons === 1 ? "" : "s"}
            </span>
          </div>
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-fg transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-100">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {course.description}
          </p>
          <div className="mt-auto flex items-center justify-between border-t border-theme pt-4">
            <span className="text-xs text-muted capitalize">
              {course.level}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted transition-all group-hover:translate-x-1 group-hover:text-purple-600 dark:group-hover:text-purple-200" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyLearning({
  isPending,
  isRejected,
}: {
  isPending: boolean;
  isRejected: boolean;
}) {
  return (
    <div className="surface flex flex-col items-center justify-center rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
        <BookOpen className="h-6 w-6 text-purple-500 dark:text-purple-300" />
      </span>
      <h3 className="text-xl font-semibold text-fg">
        {isRejected
          ? "Account not approved"
          : isPending
          ? "Awaiting approval"
          : "No courses unlocked yet"}
      </h3>
      <p className="mt-2 max-w-md text-balance text-muted">
        {isRejected
          ? "You don't have access to courses right now."
          : isPending
          ? "Once an admin approves your account, your unlocked courses will live here."
          : "An admin will grant you access to specific courses. They'll appear here once unlocked."}
      </p>
      <Link href="/courses" className="btn-primary mt-6">
        Browse the catalog
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  body,
  accent = false,
}: {
  href: string;
  icon: typeof BookOpen;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "surface flex h-full items-center gap-4 rounded-2xl border p-5 transition-all hover:border-purple-soft/40",
          accent ? "border-purple-soft/40 bg-purple/[0.04]" : "border-theme"
        )}
      >
        <span
          className={cn(
            "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl",
            accent
              ? "bg-purple/20 ring-1 ring-purple-soft/30"
              : "bg-purple/10 ring-1 ring-purple-soft/20"
          )}
        >
          <Icon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-fg">{title}</div>
          <div className="mt-0.5 text-xs text-muted">{body}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted transition-all group-hover:translate-x-1 group-hover:text-purple-600 dark:group-hover:text-purple-200" />
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    approved: {
      label: "Approved",
      classes:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
    },
    pending: {
      label: "Awaiting approval",
      classes:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    },
    rejected: {
      label: "Not approved",
      classes:
        "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30",
    },
  }[status] ?? {
    label: status,
    classes: "bg-haze/10 text-muted border-theme",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-wider",
        config.classes
      )}
    >
      {config.label}
    </span>
  );
}
