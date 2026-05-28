import Link from "next/link";
import { Users, BookOpen, GraduationCap, Clock, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";

export default async function AdminDashboard() {
  const [
    totalUsers,
    pendingUsers,
    approvedUsers,
    totalCourses,
    publishedCourses,
    totalLessons,
    totalEnrollments,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "pending" } }),
    prisma.user.count({ where: { status: "approved" } }),
    prisma.course.count(),
    prisma.course.count({ where: { published: true } }),
    prisma.lesson.count(),
    prisma.enrollment.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const approvalRate = totalUsers > 0 ? (approvedUsers / totalUsers) * 100 : 0;

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            Overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted">
            High-level view of users, courses, and activity.
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New course
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total members"
          value={totalUsers}
          icon={Users}
          progress={approvalRate}
          trend={`${approvedUsers} approved`}
        />
        <StatCard
          label="Pending review"
          value={pendingUsers}
          icon={Clock}
          trend={pendingUsers === 0 ? "All clear" : "Action needed"}
        />
        <StatCard
          label="Courses"
          value={totalCourses}
          icon={BookOpen}
          trend={`${publishedCourses} published`}
        />
        <StatCard
          label="Course unlocks"
          value={totalEnrollments}
          icon={GraduationCap}
          trend={`${totalLessons} lessons total`}
        />
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface rounded-2xl border border-theme p-6 backdrop-blur-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-fg">Recent signups</h2>
            <Link
              href="/admin/users"
              className="text-xs text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300"
            >
              View all →
            </Link>
          </div>
          {recentSignups.length === 0 ? (
            <p className="rounded-lg border border-dashed border-theme-strong px-4 py-8 text-center text-sm text-muted">
              No signups yet. Your first member will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-current/5">
              {recentSignups.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {u.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 rounded-full"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple/15 text-sm text-purple-700 dark:text-purple-200">
                        {u.name?.[0] ?? "?"}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm text-fg">
                        {u.name ?? "Unknown"}
                      </div>
                      <div className="truncate text-xs text-muted">
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <StatusPill status={u.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface rounded-2xl border border-theme p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-lg font-semibold text-fg">Quick actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-lg border border-theme bg-current/[0.02] px-4 py-3 text-sm text-fg transition-colors hover:border-purple-soft/40 hover:bg-purple/[0.05]"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                Review users
              </span>
              {pendingUsers > 0 && (
                <span className="rounded-full bg-purple px-2 py-0.5 text-xs text-white">
                  {pendingUsers}
                </span>
              )}
            </Link>
            <Link
              href="/admin/courses/new"
              className="flex items-center justify-between rounded-lg border border-theme bg-current/[0.02] px-4 py-3 text-sm text-fg transition-colors hover:border-purple-soft/40 hover:bg-purple/[0.05]"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                Create course
              </span>
            </Link>
            <Link
              href="/admin/courses"
              className="flex items-center justify-between rounded-lg border border-theme bg-current/[0.02] px-4 py-3 text-sm text-fg transition-colors hover:border-purple-soft/40 hover:bg-purple/[0.05]"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                Manage catalog
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const config =
    {
      approved:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
      pending:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
      rejected:
        "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30",
    }[status] ?? "bg-current/5 text-muted border-theme";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${config}`}
    >
      {status}
    </span>
  );
}
