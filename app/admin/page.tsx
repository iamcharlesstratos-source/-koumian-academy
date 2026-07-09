import Link from "next/link";
import {
  Users,
  BookOpen,
  Activity,
  CheckCircle2,
  Plus,
  Newspaper,
  MessageCircle,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";

const DAY = 24 * 60 * 60 * 1000;

export default async function AdminDashboard() {
  const now = Date.now();
  const cutoff30 = new Date(now - 30 * DAY);

  const [
    usersAll,
    courseCount,
    lessonCount,
    enrollments,
    completions,
    totalPosts,
    totalComments,
  ] = await Promise.all([
    prisma.user.findMany({ select: { createdAt: true, status: true } }),
    prisma.course.count({ where: { published: true } }),
    prisma.lesson.count({ where: { published: true } }),
    prisma.enrollment.findMany({ select: { userId: true } }),
    prisma.lessonCompletion.findMany({
      select: { userId: true, completedAt: true },
    }),
    prisma.post.count(),
    prisma.comment.count(),
  ]);

  const totalUsers = usersAll.length;
  const approvedUsers = usersAll.filter((u) => u.status === "approved").length;
  const pendingUsers = usersAll.filter((u) => u.status === "pending").length;
  const signups30d = usersAll.filter((u) => u.createdAt >= cutoff30).length;

  const enrolledUserCount = new Set(enrollments.map((e) => e.userId)).size;
  const learnerUserCount = new Set(completions.map((c) => c.userId)).size;
  const totalCompletions = completions.length;
  const completions30d = completions.filter(
    (c) => c.completedAt >= cutoff30
  ).length;
  const activeLearners = new Set(
    completions.filter((c) => c.completedAt >= cutoff30).map((c) => c.userId)
  ).size;

  // Member funnel — a single violet ramp (calm, one accent) instead of 5 colors.
  const funnel = [
    { label: "Signed up", count: totalUsers, fill: "bg-purple/30" },
    { label: "Approved", count: approvedUsers, fill: "bg-purple/50" },
    { label: "Enrolled", count: enrolledUserCount, fill: "bg-purple/70" },
    { label: "Learners", count: learnerUserCount, fill: "bg-purple/85" },
    { label: "Active", count: activeLearners, fill: "bg-purple" },
  ];
  const funnelTotal = Math.max(
    1,
    funnel.reduce((s, f) => s + f.count, 0)
  );

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            Analytics
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-fg">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted">
            Everything at a glance. Details are one click away.
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New course
        </Link>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Approved members"
          value={approvedUsers}
          icon={Users}
          trend={
            pendingUsers > 0 ? `${pendingUsers} pending review` : "All reviewed"
          }
        />
        <StatCard
          label="Active learners"
          value={activeLearners}
          icon={Activity}
          tone="emerald"
          trend="Last 30 days"
        />
        <StatCard
          label="Published courses"
          value={courseCount}
          icon={BookOpen}
          tone="sky"
          trend={`${lessonCount} lesson${lessonCount === 1 ? "" : "s"} live`}
        />
        <StatCard
          label="Lessons completed"
          value={totalCompletions}
          icon={CheckCircle2}
          tone="amber"
          trend={`${completions30d} in last 30 days`}
        />
      </section>

      {/* Member journey */}
      <section className="mt-6 surface rounded-2xl border border-theme p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">Member journey</h2>
          <span className="text-xs text-muted">
            {totalUsers} member{totalUsers === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-current/10">
          {funnel.map((f) => (
            <div
              key={f.label}
              className={`${f.fill} h-full transition-all duration-500`}
              style={{ width: `${(f.count / funnelTotal) * 100}%` }}
              title={`${f.label}: ${f.count}`}
            />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {funnel.map((f) => (
            <div key={f.label}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${f.fill}`} />
                <span className="text-xs text-muted">{f.label}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-fg">
                {f.count}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activity + Manage */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="surface rounded-2xl border border-theme p-6">
          <h2 className="mb-5 text-lg font-semibold text-fg">
            Activity{" "}
            <span className="font-normal text-muted">· last 30 days</span>
          </h2>
          <div className="space-y-4">
            <ActivityRow icon={Users} label="New signups" value={signups30d} />
            <ActivityRow
              icon={CheckCircle2}
              label="Lessons completed"
              value={completions30d}
            />
            <ActivityRow
              icon={Newspaper}
              label="Community posts"
              value={totalPosts}
            />
            <ActivityRow
              icon={MessageCircle}
              label="Comments"
              value={totalComments}
            />
          </div>
        </div>

        <div className="surface rounded-2xl border border-theme p-6">
          <h2 className="mb-3 text-lg font-semibold text-fg">Manage</h2>
          <div className="space-y-1">
            <ManageLink
              href="/admin/users"
              icon={Users}
              label="Members"
              hint={
                pendingUsers > 0 ? `${pendingUsers} pending` : `${totalUsers}`
              }
              highlight={pendingUsers > 0}
            />
            <ManageLink
              href="/admin/courses"
              icon={BookOpen}
              label="Courses"
              hint={`${courseCount}`}
            />
            <ManageLink href="/community" icon={Newspaper} label="Community" />
          </div>
        </div>
      </section>
    </>
  );
}

function ActivityRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-3 text-muted">
        <Icon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
        {label}
      </span>
      <span className="font-semibold tabular-nums text-fg">{value}</span>
    </div>
  );
}

function ManageLink({
  href,
  icon: Icon,
  label,
  hint,
  highlight = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-purple/[0.06]"
    >
      <span className="flex items-center gap-3 text-sm font-medium text-fg">
        <Icon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
        {label}
      </span>
      <span className="flex items-center gap-2 text-xs text-muted">
        {hint && (
          <span
            className={
              highlight
                ? "rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300"
                : ""
            }
          >
            {hint}
          </span>
        )}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
