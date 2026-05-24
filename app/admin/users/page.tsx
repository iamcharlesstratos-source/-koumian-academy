import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRow } from "@/components/admin/UserRow";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await auth();
  const [users, courses] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        enrollments: { select: { courseId: true } },
      },
    }),
    prisma.course.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, category: true },
    }),
  ]);

  const pendingUsers = users.filter((u) => u.status === "pending");
  const otherUsers = users.filter((u) => u.status !== "pending");

  return (
    <>
      <header className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
          Users
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-fg">
          Member management
        </h1>
        <p className="mt-2 text-sm text-muted">
          Approve or reject pending sign-ups, and control per-course access.
        </p>
      </header>

      {pendingUsers.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-fg">
              Pending review
              <span className="ml-2 text-muted">({pendingUsers.length})</span>
            </h2>
          </div>
          <div className="space-y-2.5">
            {pendingUsers.map((u) => (
              <UserRow
                key={u.id}
                user={{
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  image: u.image,
                  role: u.role,
                  status: u.status,
                  createdAt: u.createdAt,
                  enrolledCourseIds: u.enrollments.map((e) => e.courseId),
                }}
                courses={courses}
                isSelf={u.id === session?.user.id}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600 dark:text-purple-300" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-fg">
            All members
            <span className="ml-2 text-muted">({otherUsers.length})</span>
          </h2>
        </div>
        {otherUsers.length === 0 ? (
          <div className="surface rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center">
            <p className="text-sm text-muted">
              No approved or rejected members yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {otherUsers.map((u) => (
              <UserRow
                key={u.id}
                user={{
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  image: u.image,
                  role: u.role,
                  status: u.status,
                  createdAt: u.createdAt,
                  enrolledCourseIds: u.enrollments.map((e) => e.courseId),
                }}
                courses={courses}
                isSelf={u.id === session?.user.id}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
