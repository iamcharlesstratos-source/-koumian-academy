import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UsersManager } from "@/components/admin/UsersManager";

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
          Approve or reject sign-ups, control per-course access, and manage
          members in bulk.
        </p>
      </header>

      <UsersManager
        users={users}
        courses={courses}
        currentUserId={session?.user.id ?? ""}
      />
    </>
  );
}
