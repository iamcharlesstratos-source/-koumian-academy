import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Mail,
  AtSign,
  Calendar,
  Clock,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/public/Nav";
import { Footer } from "@/components/public/Footer";
import { formatDuration } from "@/lib/utils";

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
              lessons: {
                orderBy: { order: "asc" },
                select: { id: true },
              },
            },
          },
        },
        orderBy: { grantedAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const enrolledCourses = user.enrollments.map((e) => e.course);
  const memberSince = user.createdAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Nav user={session.user} />
      <main className="px-6 pb-20 pt-32 sm:pt-40">
        <div className="mx-auto max-w-5xl">
          <header className="mb-12">
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
            {/* Identity card */}
            <aside className="surface rounded-2xl border border-theme p-6 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-24 w-24 rounded-full ring-4 ring-purple/15"
                  />
                ) : (
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-purple/15 text-3xl font-semibold text-purple-700 ring-4 ring-purple/10 dark:text-purple-200">
                    {user.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-fg">
                  {user.name ?? "Unknown"}
                </h2>
                {user.role === "admin" && (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-purple-soft/30 bg-purple/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-purple-700 dark:text-purple-200">
                    <ShieldCheck className="h-3 w-3" />
                    Administrator
                  </span>
                )}
                <div className="mt-4">
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

            {/* My courses */}
            <section>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-fg">
                    My courses
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {enrolledCourses.length === 0
                      ? "Courses you have access to will appear here."
                      : `${enrolledCourses.length} course${
                          enrolledCourses.length === 1 ? "" : "s"
                        } unlocked`}
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="hidden text-xs text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300 sm:inline-flex"
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
                  {enrolledCourses.map((c) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.slug}${
                        c.lessons[0] ? `/lessons/${c.lessons[0].id}` : ""
                      }`}
                      className="group surface flex flex-col rounded-2xl border border-theme p-5 backdrop-blur-sm transition-all hover:border-purple-soft/40"
                    >
                      <span className="inline-flex w-fit items-center rounded-full border border-purple-soft/30 bg-purple/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-purple-700 dark:text-purple-200">
                        {c.category}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold leading-snug text-fg transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-100">
                        {c.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {c.description}
                      </p>
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
                          Continue
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer signedIn />
    </>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
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
