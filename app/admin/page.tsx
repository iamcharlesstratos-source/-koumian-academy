import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  CheckCircle2,
  Plus,
  TrendingUp,
  Newspaper,
  MessageCircle,
  Megaphone,
  Clock,
} from "lucide-react";
import { TrendChart } from "@/components/admin/TrendChart";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";

const DAY = 24 * 60 * 60 * 1000;

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function AdminDashboard() {
  const now = Date.now();
  const cutoff30 = new Date(now - 30 * DAY);

  const [
    usersAll,
    recentSignups,
    courses,
    publishedLessons,
    enrollments,
    completions,
    totalPosts,
    totalComments,
    totalAnnouncements,
    approvedMembers,
  ] = await Promise.all([
    prisma.user.findMany({ select: { createdAt: true, status: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, category: true },
    }),
    prisma.lesson.findMany({
      where: { published: true },
      select: { id: true, courseId: true },
    }),
    prisma.enrollment.findMany({ select: { courseId: true, userId: true } }),
    prisma.lessonCompletion.findMany({
      select: { lessonId: true, userId: true, completedAt: true },
    }),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.announcement.count(),
    prisma.user.findMany({
      where: { status: "approved", role: { not: "admin" } },
      select: { id: true, name: true, email: true, image: true },
    }),
  ]);

  // ─── Member stats ───
  const totalUsers = usersAll.length;
  const approvedUsers = usersAll.filter((u) => u.status === "approved").length;
  const pendingUsers = usersAll.filter((u) => u.status === "pending").length;
  const rejectedUsers = usersAll.filter((u) => u.status === "rejected").length;
  const approvalRate = totalUsers > 0 ? (approvedUsers / totalUsers) * 100 : 0;

  // ─── Lesson / course maps ───
  const lessonToCourse = new Map(publishedLessons.map((l) => [l.id, l.courseId]));
  const lessonsPerCourse = new Map<string, number>();
  for (const l of publishedLessons) {
    lessonsPerCourse.set(l.courseId, (lessonsPerCourse.get(l.courseId) ?? 0) + 1);
  }
  const enrollPerCourse = new Map<string, number>();
  for (const e of enrollments) {
    enrollPerCourse.set(e.courseId, (enrollPerCourse.get(e.courseId) ?? 0) + 1);
  }
  const completionsPerCourse = new Map<string, number>();
  for (const c of completions) {
    const courseId = lessonToCourse.get(c.lessonId);
    if (!courseId) continue;
    completionsPerCourse.set(
      courseId,
      (completionsPerCourse.get(courseId) ?? 0) + 1
    );
  }

  const totalCompletions = completions.length;
  const totalEnrollments = enrollments.length;
  const activeLearners = new Set(
    completions.filter((c) => c.completedAt >= cutoff30).map((c) => c.userId)
  ).size;

  // ─── Member journey funnel ───
  const enrolledUserCount = new Set(enrollments.map((e) => e.userId)).size;
  const learnerUserCount = new Set(completions.map((c) => c.userId)).size;
  const funnel = [
    { label: "Signed up", count: totalUsers, color: "bg-slate-400" },
    { label: "Approved", count: approvedUsers, color: "bg-sky-500" },
    { label: "Enrolled", count: enrolledUserCount, color: "bg-purple" },
    { label: "Learners", count: learnerUserCount, color: "bg-amber-500" },
    { label: "Active · 30d", count: activeLearners, color: "bg-emerald-500" },
  ];
  const funnelTotal = Math.max(
    1,
    funnel.reduce((s, f) => s + f.count, 0)
  );

  // ─── Inactive members (no completion in 30 days) ───
  const lastActivityByUser = new Map<string, Date>();
  for (const c of completions) {
    const prev = lastActivityByUser.get(c.userId);
    if (!prev || c.completedAt > prev) lastActivityByUser.set(c.userId, c.completedAt);
  }
  const inactiveMembers = approvedMembers
    .map((m) => ({ ...m, lastActive: lastActivityByUser.get(m.id) ?? null }))
    .filter((m) => !m.lastActive || m.lastActive < cutoff30)
    .sort((a, b) => {
      if (!a.lastActive && !b.lastActive) return 0;
      if (!a.lastActive) return -1;
      if (!b.lastActive) return 1;
      return a.lastActive.getTime() - b.lastActive.getTime();
    })
    .slice(0, 6);

  // ─── Course performance (sorted by enrolled, then completions) ───
  const coursePerf = courses
    .map((c) => {
      const enrolled = enrollPerCourse.get(c.id) ?? 0;
      const lessons = lessonsPerCourse.get(c.id) ?? 0;
      const done = completionsPerCourse.get(c.id) ?? 0;
      const possible = enrolled * lessons;
      const pct = possible > 0 ? Math.min(100, Math.round((done / possible) * 100)) : null;
      return { ...c, enrolled, lessons, done, pct };
    })
    .sort((a, b) => b.enrolled - a.enrolled || b.done - a.done);

  // ─── Signups over the last 8 weeks (rolling) ───
  const WEEK = 7 * DAY;
  const weekBuckets = Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i;
    const repTs = now - weeksAgo * WEEK;
    return { label: fmtDate(repTs), count: 0 };
  });
  for (const u of usersAll) {
    const weeksAgo = Math.floor((now - u.createdAt.getTime()) / WEEK);
    if (weeksAgo >= 0 && weeksAgo < 8) {
      weekBuckets[7 - weeksAgo].count += 1;
    }
  }
  const maxWeek = Math.max(1, ...weekBuckets.map((b) => b.count));
  const signups8w = weekBuckets.reduce((s, b) => s + b.count, 0);

  // ─── Lessons completed over the last 8 weeks (engagement trend) ───
  const completionWeekBuckets = Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i;
    const repTs = now - weeksAgo * WEEK;
    return { label: fmtDate(repTs), value: 0 };
  });
  for (const c of completions) {
    const weeksAgo = Math.floor((now - c.completedAt.getTime()) / WEEK);
    if (weeksAgo >= 0 && weeksAgo < 8) {
      completionWeekBuckets[7 - weeksAgo].value += 1;
    }
  }
  const completions8w = completionWeekBuckets.reduce((s, b) => s + b.value, 0);

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
            Members, learning activity, and community health at a glance.
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New course
        </Link>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Approved members"
          value={approvedUsers}
          icon={Users}
          progress={approvalRate}
          trend={pendingUsers > 0 ? `${pendingUsers} pending review` : "All reviewed"}
        />
        <StatCard
          label="Active learners"
          value={activeLearners}
          icon={Activity}
          tone="emerald"
          trend="completed a lesson · 30d"
        />
        <StatCard
          label="Published courses"
          value={courses.length}
          icon={BookOpen}
          tone="sky"
          trend={`${totalEnrollments} course unlocks`}
        />
        <StatCard
          label="Lessons completed"
          value={totalCompletions}
          icon={CheckCircle2}
          tone="amber"
          trend={`${publishedLessons.length} lessons live`}
        />
      </section>

      {/* Member journey funnel */}
      <section className="mt-6 surface rounded-2xl border border-theme p-6 backdrop-blur-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">Member journey</h2>
          <span className="text-xs text-muted">{totalUsers} total members</span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-current/10">
          {funnel.map((f) => (
            <div
              key={f.label}
              className={`${f.color} h-full transition-all duration-500`}
              style={{ width: `${(f.count / funnelTotal) * 100}%` }}
              title={`${f.label}: ${f.count}`}
            />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {funnel.map((f) => (
            <div key={f.label}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${f.color}`} />
                <span className="text-xs text-muted">{f.label}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold text-fg">{f.count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Signups trend + member breakdown */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface rounded-2xl border border-theme p-6 backdrop-blur-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                New signups
              </h2>
              <p className="mt-1 text-xs text-muted">
                Last 8 weeks · {signups8w} total
              </p>
            </div>
          </div>

          {totalUsers === 0 ? (
            <p className="rounded-lg border border-dashed border-theme-strong px-4 py-10 text-center text-sm text-muted">
              No signups yet. New members will chart here.
            </p>
          ) : (
            <div className="flex h-40 items-end justify-between gap-2">
              {weekBuckets.map((b, i) => (
                <div
                  key={i}
                  className="group flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="relative w-full rounded-t-md bg-gradient-to-t from-purple-deep to-purple transition-all duration-500 hover:opacity-90"
                      style={{
                        height: `${b.count > 0 ? Math.max(8, (b.count / maxWeek) * 100) : 2}%`,
                      }}
                    >
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-medium text-fg opacity-0 transition-opacity group-hover:opacity-100">
                        {b.count}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase tracking-wide text-muted">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface rounded-2xl border border-theme p-6 backdrop-blur-sm">
          <h2 className="mb-5 text-lg font-semibold text-fg">Members by status</h2>
          <div className="space-y-4">
            <StatusBar
              label="Approved"
              count={approvedUsers}
              total={totalUsers}
              color="bg-emerald-500"
            />
            <StatusBar
              label="Pending"
              count={pendingUsers}
              total={totalUsers}
              color="bg-amber-500"
            />
            <StatusBar
              label="Rejected"
              count={rejectedUsers}
              total={totalUsers}
              color="bg-rose-500"
            />
          </div>

          <hr className="my-5 border-theme" />

          <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
            Community activity
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat icon={Newspaper} value={totalPosts} label="Posts" />
            <MiniStat icon={MessageCircle} value={totalComments} label="Comments" />
            <MiniStat icon={Megaphone} value={totalAnnouncements} label="News" />
          </div>
        </div>
      </section>

      {/* Lessons completed — engagement trend */}
      <section className="mt-6 surface rounded-2xl border border-theme p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              Lessons completed
            </h2>
            <p className="mt-1 text-xs text-muted">
              Last 8 weeks · {completions8w} total
            </p>
          </div>
        </div>
        {totalCompletions === 0 ? (
          <p className="rounded-lg border border-dashed border-theme-strong px-4 py-10 text-center text-sm text-muted">
            No lesson completions yet. Learner activity will chart here.
          </p>
        ) : (
          <TrendChart points={completionWeekBuckets} variant="emerald" />
        )}
      </section>

      {/* Course performance */}
      <section className="mt-6 surface rounded-2xl border border-theme p-6 backdrop-blur-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">Course performance</h2>
          <Link
            href="/admin/courses"
            className="text-xs text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300"
          >
            Manage courses →
          </Link>
        </div>

        {coursePerf.length === 0 ? (
          <p className="rounded-lg border border-dashed border-theme-strong px-4 py-10 text-center text-sm text-muted">
            No published courses yet. Create one to start tracking engagement.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme text-left text-[10px] uppercase tracking-wider text-muted">
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 text-center font-medium">Enrolled</th>
                  <th className="pb-3 text-center font-medium">Lessons</th>
                  <th className="pb-3 text-center font-medium">Done</th>
                  <th className="hidden pb-3 font-medium sm:table-cell">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/5">
                {coursePerf.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-3">
                      <Link
                        href={`/admin/courses/${c.id}`}
                        className="font-medium text-fg transition-colors hover:text-purple-600 dark:hover:text-purple-300"
                      >
                        {c.title}
                      </Link>
                      <div className="text-[10px] uppercase tracking-wider text-muted">
                        {c.category}
                      </div>
                    </td>
                    <td className="py-3 text-center text-fg">{c.enrolled}</td>
                    <td className="py-3 text-center text-muted">{c.lessons}</td>
                    <td className="py-3 text-center text-muted">{c.done}</td>
                    <td className="hidden py-3 sm:table-cell">
                      {c.pct === null ? (
                        <span className="text-xs text-muted">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-current/10">
                            <div
                              className="h-full rounded-full bg-purple"
                              style={{ width: `${c.pct}%` }}
                            />
                          </div>
                          <span className="w-9 text-right text-xs text-fg">
                            {c.pct}%
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Inactive members — needs attention */}
      <section className="mt-6 surface rounded-2xl border border-theme p-6 backdrop-blur-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
            <Clock className="h-4 w-4 text-amber-500 dark:text-amber-300" />
            Needs attention
          </h2>
          <span className="text-xs text-muted">
            {inactiveMembers.length} inactive · 30 days+
          </span>
        </div>
        {inactiveMembers.length === 0 ? (
          <p className="rounded-lg border border-dashed border-theme-strong px-4 py-8 text-center text-sm text-muted">
            Everyone&apos;s been active recently. 🎉
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {inactiveMembers.map((m) => (
              <li key={m.id}>
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between gap-3 rounded-xl border border-theme bg-current/[0.02] p-3 transition-colors hover:border-purple-soft/40 hover:bg-purple/[0.05]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {m.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 flex-shrink-0 rounded-full"
                      />
                    ) : (
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple/15 text-sm text-purple-700 dark:text-purple-200">
                        {m.name?.[0] ?? "?"}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-fg">
                        {m.name ?? "Member"}
                      </div>
                      <div className="truncate text-[11px] text-muted">
                        {m.lastActive
                          ? `Last active ${fmtDate(m.lastActive.getTime())}`
                          : "No lessons completed yet"}
                      </div>
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                    Inactive
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent signups + quick actions */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                <li key={u.id} className="flex items-center justify-between py-3">
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
                      <div className="truncate text-xs text-muted">{u.email}</div>
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

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="text-fg">
          <span className="font-medium">{count}</span>{" "}
          <span className="text-muted">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-current/10">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Newspaper;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-theme bg-current/[0.02] p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-purple-600 dark:text-purple-300" />
      <div className="mt-1.5 text-lg font-semibold text-fg">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
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
