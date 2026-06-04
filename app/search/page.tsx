import Link from "next/link";
import { Search as SearchIcon, BookOpen, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CourseCard, type CourseCardData } from "@/components/public/CourseCard";
import { GlobalSearch } from "@/components/shared/GlobalSearch";

export const dynamic = "force-dynamic";

type MemberResult = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  status: string;
};

const STATUS_STYLE: Record<string, string> = {
  approved:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  pending:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  rejected:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string | string[] };
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const raw = Array.isArray(searchParams.q)
    ? searchParams.q[0]
    : searchParams.q;
  const q = (raw ?? "").trim().slice(0, 80);

  // Empty query → invite the user to type.
  if (!q) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 pb-24 pt-10 text-center sm:px-6 lg:pt-28">
        <GlobalSearch
          className="mb-10 w-full max-w-md lg:hidden"
          placeholder={isAdmin ? "Search courses & members…" : "Search courses…"}
        />
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple/10 text-purple-600 dark:text-purple-300">
          <SearchIcon className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Search Koumian
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          {isAdmin
            ? "Find courses and members by name, email, or topic. Type in the search bar above to begin."
            : "Find courses by title or topic. Type in the search bar above to begin."}
        </p>
      </div>
    );
  }

  // Run searches in parallel; degrade gracefully if the DB hiccups.
  let courses: CourseCardData[] = [];
  let members: MemberResult[] = [];
  try {
    const [courseRows, memberRows] = await Promise.all([
      prisma.course.findMany({
        where: {
          ...(isAdmin ? {} : { published: true }),
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          category: true,
          level: true,
          durationMin: true,
          priceCents: true,
          coverImageUrl: true,
          _count: { select: { lessons: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 24,
      }),
      isAdmin
        ? prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              status: true,
            },
            orderBy: { createdAt: "desc" },
            take: 24,
          })
        : Promise.resolve([] as MemberResult[]),
    ]);
    courses = courseRows.map((c) => ({
      ...c,
      lessonCount: c._count.lessons,
    }));
    members = memberRows;
  } catch {
    // Leave results empty — the empty-state below renders a friendly message.
  }

  const totalResults = courses.length + members.length;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-2">
      <GlobalSearch
        defaultValue={q}
        className="mb-6 w-full lg:hidden"
        placeholder={isAdmin ? "Search courses & members…" : "Search courses…"}
      />
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Search results
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
          “{q}”
        </h1>
        <p className="mt-1 text-sm text-muted">
          {totalResults === 0
            ? "No matches found."
            : `${totalResults} result${totalResults === 1 ? "" : "s"} found`}
        </p>
      </header>

      {totalResults === 0 ? (
        <div className="surface rounded-2xl border border-theme p-10 text-center backdrop-blur-sm">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-current/5 text-muted">
            <SearchIcon className="h-5 w-5" />
          </span>
          <p className="text-sm text-fg">
            Nothing matched <span className="font-medium">“{q}”</span>.
          </p>
          <p className="mt-1 text-sm text-muted">
            Try a different keyword{isAdmin ? ", a member's name, or an email" : " or topic"}.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Courses */}
          {courses.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                Courses
                <span className="text-muted">· {courses.length}</span>
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {courses.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Members (admin only) */}
          {isAdmin && members.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                Members
                <span className="text-muted">· {members.length}</span>
              </h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {members.map((m) => (
                  <li key={m.id}>
                    <Link
                      href="/admin/users"
                      className="surface flex items-center justify-between gap-3 rounded-xl border border-theme p-3 transition-colors hover:border-purple-soft/40"
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
                            {m.name?.[0] ?? m.email[0]?.toUpperCase() ?? "?"}
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-fg">
                              {m.name ?? "Member"}
                            </span>
                            {m.role === "admin" && (
                              <span className="flex-shrink-0 rounded-full border border-purple-soft/40 bg-purple/10 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-200">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="truncate text-[11px] text-muted">
                            {m.email}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize ${
                          STATUS_STYLE[m.status] ??
                          "border-theme text-muted"
                        }`}
                      >
                        {m.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
