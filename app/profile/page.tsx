import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpen,
  Mail,
  AtSign,
  Calendar,
  Clock,
  Lock,
  Settings,
  ShieldCheck,
  Trophy,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  Newspaper,
  Flame,
  Medal,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/public/Nav";
import { Footer } from "@/components/public/Footer";
import { formatDuration, timeAgo } from "@/lib/utils";

export const metadata = { title: "My Profile — Koumian Academy" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              lessons: { orderBy: { order: "asc" }, select: { id: true } },
            },
          },
        },
        orderBy: { grantedAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const enrolledCourses = user.enrollments.map((e) => e.course);

  // Per-course progress.
  const allLessonIds = enrolledCourses.flatMap((c) => c.lessons.map((l) => l.id));
  const [completions, myPosts, myCommentCount] = await Promise.all([
    allLessonIds.length === 0
      ? Promise.resolve([] as { lessonId: string }[])
      : prisma.lessonCompletion.findMany({
          where: { userId: user.id, lessonId: { in: allLessonIds } },
          select: { lessonId: true },
        }),
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, type: true, body: true, createdAt: true },
    }),
    prisma.comment.count({ where: { authorId: user.id } }),
  ]);

  const completedSet = new Set(completions.map((c) => c.lessonId));
  const progressByCourse = new Map(
    enrolledCourses.map((c) => {
      const total = c.lessons.length;
      const done = c.lessons.filter((l) => completedSet.has(l.id)).length;
      return [c.id, { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) }];
    })
  );

  const finishedCourses = enrolledCourses.filter((c) => {
    const p = progressByCourse.get(c.id);
    return p && p.total > 0 && p.done === p.total;
  });

  const totalLessons = allLessonIds.length;
  const lessonsCompleted = completions.length;
  const overallPct =
    totalLessons === 0 ? 0 : Math.round((lessonsCompleted / totalLessons) * 100);

  const feedCount = myPosts.filter((p) => p.type === "feed").length;
  const winCount = myPosts.filter((p) => p.type === "win").length;

  const badges: {
    label: string;
    desc: string;
    earned: boolean;
    icon: LucideIcon;
  }[] = [
    { label: "First steps", desc: "Completed your first lesson", earned: lessonsCompleted >= 1, icon: CheckCircle2 },
    { label: "Momentum", desc: "Completed 5 lessons", earned: lessonsCompleted >= 5, icon: Flame },
    { label: "Finisher", desc: "Completed a full course", earned: finishedCourses.length >= 1, icon: GraduationCap },
    { label: "Scholar", desc: "Completed 3 courses", earned: finishedCourses.length >= 3, icon: Medal },
    { label: "Contributor", desc: "Shared a community post", earned: feedCount + winCount >= 1, icon: Newspaper },
    { label: "Big winner", desc: "Shared a Big Win", earned: winCount >= 1, icon: Trophy },
  ];
  const earnedCount = badges.filter((b) => b.earned).length;

  const memberSince = user.createdAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isActive = user.status === "approved" || user.role === "admin";

  return (
    <>
      <Nav user={session.user} />
      <main className="px-6 pb-20 pt-32 sm:pt-40">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
              My profile
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
              Hello, {user.name?.split(" ")[0] ?? "there"}.
            </h1>
            <p className="mt-3 text-muted">
              Manage your account and continue your learning journey.
            </p>
          </header>

          {/* Learning stats */}
          <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile icon={CheckCircle2} value={lessonsCompleted} label="Lessons completed" />
            <StatTile icon={GraduationCap} value={finishedCourses.length} label="Courses finished" />
            <StatTile icon={Award} value={finishedCourses.length} label="Certificates" />
            <StatTile icon={TrendingUp} value={`${overallPct}%`} label="Overall progress" />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
            {/* Identity card */}
            <aside className="surface h-fit rounded-2xl border border-theme p-6 backdrop-blur-sm lg:sticky lg:top-28">
              <div className="flex flex-col items-center text-center">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-purple/15"
                  />
                ) : (
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-purple/15 text-3xl font-semibold text-purple-700 ring-4 ring-purple/10 dark:text-purple-200">
                    {user.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-fg">
                  {user.name ?? "Unknown"}
                </h2>
                {user.bio && (
                  <p className="mt-2 text-balance text-sm text-muted">{user.bio}</p>
                )}
                {user.role === "admin" && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-purple-soft/30 bg-purple/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-purple-700 dark:text-purple-200">
                    <ShieldCheck className="h-3 w-3" />
                    Administrator
                  </span>
                )}
                <div className="mt-3">
                  <StatusBadge status={user.status} />
                </div>
              </div>

              <hr className="my-6 border-theme" />

              <dl className="space-y-3 text-sm">
                <Row icon={Mail} label="Email" value={user.email} />
                {user.username && (
                  <Row icon={AtSign} label="Username" value={user.username} />
                )}
                <Row icon={Calendar} label="Member since" value={memberSince} />
              </dl>

              <hr className="my-6 border-theme" />

              <Link
                href="/profile/settings"
                className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-theme-strong bg-current/[0.02] px-6 py-3 text-sm font-medium text-fg transition-colors hover:bg-current/[0.05]"
              >
                <Settings className="h-4 w-4" />
                Account settings
              </Link>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="btn-secondary w-full justify-center">
                  Sign out
                </button>
              </form>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-purple-soft/30 bg-purple/10 px-6 py-3 text-sm font-medium text-purple-700 transition-colors hover:bg-purple/15 dark:text-purple-200"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Open admin dashboard
                </Link>
              )}
            </aside>

            {/* Right column */}
            <div className="space-y-10">
              {/* Achievements */}
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-xl font-semibold tracking-tight text-fg">
                    Achievements
                  </h2>
                  <span className="text-xs text-muted">
                    {earnedCount} / {badges.length} earned
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {badges.map((b) => (
                    <div
                      key={b.label}
                      className={`surface rounded-xl border p-4 text-center transition-colors ${
                        b.earned
                          ? "border-purple-soft/40 bg-purple/[0.05]"
                          : "border-theme opacity-55"
                      }`}
                      title={b.desc}
                    >
                      <span
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${
                          b.earned
                            ? "bg-purple/15 text-purple-600 dark:text-purple-300"
                            : "bg-current/5 text-muted"
                        }`}
                      >
                        <b.icon className="h-5 w-5" />
                      </span>
                      <div className="mt-2 text-xs font-semibold text-fg">
                        {b.label}
                      </div>
                      <div className="mt-0.5 text-[10px] leading-tight text-muted">
                        {b.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Certificates */}
              {finishedCourses.length > 0 && (
                <section>
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight text-fg">
                    <Award className="h-5 w-5 text-amber-500 dark:text-amber-300" />
                    My certificates
                  </h2>
                  <div className="space-y-3">
                    {finishedCourses.map((c) => (
                      <div
                        key={c.id}
                        className="surface flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 p-4"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-fg">
                            {c.title}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-muted">
                            {c.category} · Completed
                          </div>
                        </div>
                        <Link
                          href={`/courses/${c.slug}/certificate`}
                          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
                        >
                          <Award className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* My courses */}
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-xl font-semibold tracking-tight text-fg">
                    My courses
                  </h2>
                  <Link
                    href="/courses"
                    className="text-xs text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300"
                  >
                    Browse catalog →
                  </Link>
                </div>

                {user.status === "pending" ? (
                  <PendingNotice name={user.name} />
                ) : user.status === "rejected" ? (
                  <RejectedNotice />
                ) : enrolledCourses.length === 0 ? (
                  <NoCoursesYet />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {enrolledCourses.map((c) => {
                      const prog = progressByCourse.get(c.id) ?? {
                        total: c.lessons.length,
                        done: 0,
                        pct: 0,
                      };
                      const finished = prog.total > 0 && prog.done === prog.total;
                      const continueHref = `/courses/${c.slug}${
                        c.lessons[0] ? `/lessons/${c.lessons[0].id}` : ""
                      }`;
                      return (
                        <div
                          key={c.id}
                          className="group surface flex flex-col rounded-2xl border border-theme p-5 backdrop-blur-sm transition-all hover:border-purple-soft/40"
                        >
                          <Link href={continueHref} className="flex flex-1 flex-col">
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex w-fit items-center rounded-full border border-purple-soft/30 bg-purple/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-purple-700 dark:text-purple-200">
                                {c.category}
                              </span>
                              {finished && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                                  <Trophy className="h-3 w-3" />
                                  Finished
                                </span>
                              )}
                            </div>
                            <h3 className="mt-3 text-lg font-semibold leading-snug text-fg transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-100">
                              {c.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm text-muted">
                              {c.description}
                            </p>

                            {prog.total > 0 && (
                              <div className="mt-4">
                                <div className="flex items-baseline justify-between text-[11px] text-muted">
                                  <span>
                                    <span className="text-fg font-medium">
                                      {prog.done}
                                    </span>{" "}
                                    / {prog.total} complete
                                  </span>
                                  <span
                                    className={
                                      finished
                                        ? "text-emerald-600 dark:text-emerald-300"
                                        : "text-purple-600 dark:text-purple-300"
                                    }
                                  >
                                    {prog.pct}%
                                  </span>
                                </div>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-current/10">
                                  <div
                                    className={`h-full rounded-full transition-[width] duration-500 ${
                                      finished ? "bg-emerald-500" : "bg-purple"
                                    }`}
                                    style={{ width: `${prog.pct}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="mt-4 flex items-center justify-between border-t border-theme pt-4 text-xs text-muted">
                              <span className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="h-3.5 w-3.5 text-purple-500 dark:text-purple-300" />
                                  {c.lessons.length} lesson
                                  {c.lessons.length === 1 ? "" : "s"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-purple-500 dark:text-purple-300" />
                                  {formatDuration(c.durationMin)}
                                </span>
                              </span>
                              <span className="inline-flex items-center gap-1 text-purple-600 transition-transform group-hover:translate-x-1 dark:text-purple-300">
                                {finished ? "Review" : prog.done === 0 ? "Start" : "Continue"}
                                <ArrowRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </Link>

                          {finished && (
                            <Link
                              href={`/courses/${c.slug}/certificate`}
                              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
                            >
                              <Award className="h-3.5 w-3.5" />
                              Get your certificate
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Community activity */}
              {isActive && (
                <section>
                  <div className="mb-4 flex items-end justify-between">
                    <h2 className="text-xl font-semibold tracking-tight text-fg">
                      My community activity
                    </h2>
                    <Link
                      href="/community"
                      className="text-xs text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300"
                    >
                      Open feed →
                    </Link>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <MiniStat icon={Newspaper} value={feedCount} label="Posts" />
                    <MiniStat icon={Trophy} value={winCount} label="Big wins" />
                    <MiniStat icon={MessageCircle} value={myCommentCount} label="Comments" />
                  </div>

                  {myPosts.length === 0 ? (
                    <div className="surface rounded-xl border border-dashed border-theme-strong px-5 py-8 text-center text-sm text-muted">
                      You haven&apos;t posted yet.{" "}
                      <Link
                        href="/community"
                        className="text-purple-600 hover:opacity-80 dark:text-purple-300"
                      >
                        Share something →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {myPosts.slice(0, 3).map((p) => (
                        <Link
                          key={p.id}
                          href={p.type === "win" ? "/community/wins" : "/community"}
                          className="surface block rounded-xl border border-theme p-4 transition-colors hover:border-purple-soft/40"
                        >
                          <div className="flex items-center gap-2">
                            {p.type === "win" ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
                                <Trophy className="h-2.5 w-2.5" />
                                Win
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full border border-purple-soft/30 bg-purple/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-purple-700 dark:text-purple-200">
                                Post
                              </span>
                            )}
                            <span className="text-[10px] text-muted">
                              {timeAgo(p.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1.5 line-clamp-2 text-sm text-fg">
                            {p.body}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer signedIn />
    </>
  );
}

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
}) {
  return (
    <div className="surface rounded-2xl border border-theme p-5 backdrop-blur-sm">
      <Icon className="h-4 w-4 text-purple-500 dark:text-purple-300" />
      <div className="mt-3 text-3xl font-semibold tracking-tight text-fg">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <div className="surface rounded-xl border border-theme p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-purple-600 dark:text-purple-300" />
      <div className="mt-1.5 text-lg font-semibold text-fg">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-purple-500 dark:text-purple-300" />
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">
          {label}
        </dt>
        <dd className="truncate text-sm text-fg">{value}</dd>
      </div>
    </div>
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
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

function PendingNotice({ name }: { name: string | null }) {
  return (
    <div className="surface flex flex-col items-center justify-center rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center backdrop-blur-sm">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 ring-4 ring-amber-500/5">
        <Lock className="h-6 w-6 text-amber-500 dark:text-amber-300" />
      </span>
      <h3 className="text-xl font-semibold text-fg">
        Your account is awaiting approval
      </h3>
      <p className="mt-2 max-w-md text-balance text-muted">
        Thanks for joining{name ? `, ${name.split(" ")[0]}` : ""}. Once an admin
        approves your account, they can grant you access to specific courses and
        you&apos;ll see them here.
      </p>
      <Link href="/courses" className="btn-secondary mt-6">
        Browse the catalog
      </Link>
    </div>
  );
}

function RejectedNotice() {
  return (
    <div className="surface flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-500/30 px-6 py-16 text-center backdrop-blur-sm">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 ring-4 ring-rose-500/5">
        <Lock className="h-6 w-6 text-rose-500 dark:text-rose-300" />
      </span>
      <h3 className="text-xl font-semibold text-fg">Account not approved</h3>
      <p className="mt-2 max-w-md text-balance text-muted">
        Your account wasn&apos;t approved. Reach out to the Koumian Academy team
        if you think this is a mistake.
      </p>
    </div>
  );
}

function NoCoursesYet() {
  return (
    <div className="surface flex flex-col items-center justify-center rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center backdrop-blur-sm">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
        <BookOpen className="h-6 w-6 text-purple-500 dark:text-purple-300" />
      </span>
      <h3 className="text-xl font-semibold text-fg">
        You&apos;re approved — no courses yet
      </h3>
      <p className="mt-2 max-w-md text-balance text-muted">
        An admin will grant you access to specific courses. They&apos;ll appear
        here once unlocked. In the meantime, you can browse the catalog.
      </p>
      <Link href="/courses" className="btn-primary mt-6">
        Browse the catalog
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
