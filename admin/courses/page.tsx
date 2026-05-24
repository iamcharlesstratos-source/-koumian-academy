import Link from "next/link";
import { Plus, BookOpen, Clock, BarChart3, Eye, EyeOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { lessons: true, enrollments: true } } },
  });

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            Catalog
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg">
            Courses
          </h1>
          <p className="mt-2 text-sm text-muted">
            Create, edit, and organize your course library.
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New course
        </Link>
      </header>

      {courses.length === 0 ? (
        <div className="surface rounded-2xl border border-dashed border-theme-strong px-6 py-20 text-center">
          <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
            <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-300" />
          </span>
          <h2 className="text-xl font-semibold text-fg">
            Your catalog is empty
          </h2>
          <p className="mt-2 max-w-md text-balance text-sm text-muted mx-auto">
            Start by creating your first course. You&apos;ll be able to add lessons
            and publish it for members.
          </p>
          <Link href="/admin/courses/new" className="btn-primary mt-6">
            <Plus className="h-4 w-4" />
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/admin/courses/${c.id}`}
              className="group surface rounded-2xl border border-theme p-6 backdrop-blur-sm transition-all hover:border-purple-soft/40"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-full border border-purple-soft/30 bg-purple/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-purple-700 dark:text-purple-200">
                  {c.category}
                </span>
                {c.published ? (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                    <Eye className="h-3 w-3" />
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted">
                    <EyeOff className="h-3 w-3" />
                    Hidden
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold leading-snug text-fg transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-100">
                {c.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                {c.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-theme pt-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-purple-600 dark:text-purple-300" />
                  {c._count.lessons} lesson{c._count.lessons === 1 ? "" : "s"}
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-300" />
                  <span className="capitalize">{c.level}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-purple-600 dark:text-purple-300" />
                  {formatDuration(c.durationMin)}
                </span>
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-wider text-muted">
                {c._count.enrollments} enrollment
                {c._count.enrollments === 1 ? "" : "s"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
