"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Lock,
  MessageSquare,
  HelpCircle,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Lesson = {
  id: string;
  title: string;
  order: number;
  videoUrl: string | null;
  completed?: boolean;
};

type Props = {
  slug: string;
  description: string;
  lessons: Lesson[];
  canAccess: boolean;
  isAdmin: boolean;
};

const TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "modules", label: "All Modules", icon: PlayCircle },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "faq", label: "FAQ", icon: HelpCircle },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CourseTabs({
  slug,
  description,
  lessons,
  canAccess,
  isAdmin,
}: Props) {
  const [active, setActive] = useState<TabId>("overview");

  return (
    <div className="mt-16">
      {/* Tab bar */}
      <div className="surface relative overflow-hidden rounded-2xl border border-theme">
        <nav
          role="tablist"
          aria-label="Course tabs"
          className="flex overflow-x-auto"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "group relative flex flex-1 min-w-[140px] items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors",
                  isActive
                    ? "text-fg"
                    : "text-muted hover:bg-purple/5 hover:text-fg"
                )}
              >
                <tab.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-purple-600 dark:text-purple-300"
                      : "opacity-60 group-hover:opacity-100"
                  )}
                />
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="course-tab-underline"
                    className="absolute inset-x-4 -bottom-px h-px bg-purple"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          {active === "overview" && (
            <OverviewTab
              slug={slug}
              description={description}
              lessons={lessons}
              canAccess={canAccess}
              isAdmin={isAdmin}
            />
          )}
          {active === "modules" && (
            <ModulesTab
              slug={slug}
              lessons={lessons}
              canAccess={canAccess}
              isAdmin={isAdmin}
            />
          )}
          {active === "reviews" && <ReviewsTab />}
          {active === "faq" && <FaqTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({
  slug,
  description,
  lessons,
  canAccess,
  isAdmin,
}: {
  slug: string;
  description: string;
  lessons: Lesson[];
  canAccess: boolean;
  isAdmin: boolean;
}) {
  return (
    <div className="space-y-12">
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
          About this course
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
          What you&apos;ll learn
        </h2>
        <p className="mt-4 max-w-3xl text-balance leading-relaxed text-muted">
          {description}
        </p>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
              The journey
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
              Your Learning Path
            </h2>
          </div>
        </div>

        {lessons.length === 0 ? (
          <EmptyLessons isAdmin={isAdmin} slug={slug} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lessons.map((lesson, idx) => (
              <LessonPathCard
                key={lesson.id}
                slug={slug}
                lesson={lesson}
                index={idx}
                canAccess={canAccess || isAdmin}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LessonPathCard({
  slug,
  lesson,
  index,
  canAccess,
}: {
  slug: string;
  lesson: Lesson;
  index: number;
  canAccess: boolean;
}) {
  // Cycle through different gradient accents per card so the grid feels varied
  const accents = [
    "from-purple-700 to-purple-500",
    "from-violet-700 to-fuchsia-500",
    "from-purple-600 to-indigo-500",
    "from-fuchsia-700 to-purple-500",
  ];
  const accent = accents[index % accents.length];

  const Card = (
    <div className="surface group relative flex h-full flex-col overflow-hidden rounded-2xl border border-theme transition-all hover:border-purple-soft/40">
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-gradient-to-br",
          accent
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-6xl font-bold text-white/30 transition-transform duration-500 group-hover:scale-110">
            {String(lesson.order).padStart(2, "0")}
          </span>
        </div>
        {lesson.completed && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white shadow-lg">
            <CheckCircle2 className="h-3 w-3" />
            Done
          </span>
        )}
        {!canAccess && (
          <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <Lock className="h-3.5 w-3.5 text-white" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-fg transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-100">
          {lesson.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            {lesson.videoUrl ? (
              <>
                <PlayCircle className="h-3.5 w-3.5 text-purple-500 dark:text-purple-300" />
                Video lesson
              </>
            ) : (
              <>
                <BookOpen className="h-3.5 w-3.5 text-purple-500 dark:text-purple-300" />
                Reading
              </>
            )}
          </span>
          {canAccess && (
            <ArrowRight className="h-3.5 w-3.5 text-muted transition-all group-hover:translate-x-1 group-hover:text-purple-600 dark:group-hover:text-purple-200" />
          )}
        </div>
      </div>
    </div>
  );

  if (!canAccess) return Card;
  return (
    <Link href={`/courses/${slug}/lessons/${lesson.id}`} className="group">
      {Card}
    </Link>
  );
}

function ModulesTab({
  slug,
  lessons,
  canAccess,
  isAdmin,
}: {
  slug: string;
  lessons: Lesson[];
  canAccess: boolean;
  isAdmin: boolean;
}) {
  if (lessons.length === 0) {
    return <EmptyLessons isAdmin={isAdmin} slug={slug} />;
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
        Curriculum
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
        All modules
      </h2>
      <ul className="surface mt-6 overflow-hidden rounded-2xl border border-theme">
        {lessons.map((lesson, idx) => (
          <li
            key={lesson.id}
            className="border-b border-theme last:border-b-0"
          >
            {canAccess || isAdmin ? (
              <Link
                href={`/courses/${slug}/lessons/${lesson.id}`}
                className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-purple/5"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    lesson.completed
                      ? "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-300"
                      : "bg-purple/10 text-purple-700 group-hover:bg-purple/20 dark:text-purple-200"
                  )}
                >
                  {lesson.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-fg">
                    {lesson.title}
                  </div>
                  {lesson.videoUrl && (
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-300">
                      <PlayCircle className="h-3 w-3" />
                      Video
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted transition-all group-hover:translate-x-1 group-hover:text-purple-600 dark:group-hover:text-purple-200" />
              </Link>
            ) : (
              <div className="flex items-center gap-4 px-6 py-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-current/5 text-sm text-muted">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-muted">
                    {lesson.title}
                  </div>
                </div>
                <Lock className="h-4 w-4 text-muted" />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewsTab() {
  return (
    <div className="surface rounded-2xl border border-dashed border-theme-strong px-6 py-20 text-center">
      <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
        <MessageSquare className="h-6 w-6 text-purple-500 dark:text-purple-300" />
      </span>
      <h3 className="text-xl font-semibold text-fg">No reviews yet</h3>
      <p className="mt-2 max-w-md text-balance text-muted mx-auto">
        Reviews from students will appear here once the first lessons are
        completed. Be one of the first.
      </p>
    </div>
  );
}

function FaqTab() {
  return (
    <div className="surface rounded-2xl border border-dashed border-theme-strong px-6 py-20 text-center">
      <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
        <HelpCircle className="h-6 w-6 text-purple-500 dark:text-purple-300" />
      </span>
      <h3 className="text-xl font-semibold text-fg">No FAQs yet</h3>
      <p className="mt-2 max-w-md text-balance text-muted mx-auto">
        Frequently asked questions will be curated here as the community grows.
      </p>
    </div>
  );
}

function EmptyLessons({ isAdmin, slug }: { isAdmin: boolean; slug: string }) {
  return (
    <div className="surface rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center">
      <p className="text-sm text-muted">
        No lessons in this course yet.
        {isAdmin && (
          <>
            {" "}
            <Link
              href={`/admin/courses`}
              className="text-purple-600 underline underline-offset-4 hover:opacity-80 dark:text-purple-300"
            >
              Add the first lesson →
            </Link>
          </>
        )}
      </p>
      <span className="sr-only">{slug}</span>
    </div>
  );
}
