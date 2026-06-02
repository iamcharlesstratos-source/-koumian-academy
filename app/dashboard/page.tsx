import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StudentHome, type StudentCourse } from "@/components/student/StudentHome";

export const metadata = { title: "My Dashboard — Koumian Academy" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  // Admins have their own home (the admin dashboard).
  if (session.user.role === "admin") redirect("/admin");

  const userId = session.user.id;

  const [user, enrollments, latest, catalogCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              where: { published: true },
              orderBy: { order: "asc" },
              select: { id: true, order: true },
            },
          },
        },
      },
      orderBy: { grantedAt: "desc" },
    }),
    prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { _count: { select: { lessons: true } } },
    }),
    prisma.course.count({ where: { published: true } }),
  ]);

  const enrolledLessonIds = enrollments.flatMap((e) =>
    e.course.lessons.map((l) => l.id)
  );
  const completions = enrolledLessonIds.length
    ? await prisma.lessonCompletion.findMany({
        where: { userId, lessonId: { in: enrolledLessonIds } },
        select: { lessonId: true },
      })
    : [];
  const completedSet = new Set(completions.map((c) => c.lessonId));

  const enrolledCourses: StudentCourse[] = enrollments.map((e) => {
    const courseLessonIds = e.course.lessons.map((l) => l.id);
    const completedHere = courseLessonIds.filter((id) =>
      completedSet.has(id)
    ).length;
    return {
      id: e.course.id,
      slug: e.course.slug,
      title: e.course.title,
      description: e.course.description,
      category: e.course.category,
      level: e.course.level,
      durationMin: e.course.durationMin,
      firstLessonId: e.course.lessons[0]?.id,
      totalLessons: e.course.lessons.length,
      completedLessons: completedHere,
    };
  });

  const latestCourses: StudentCourse[] = latest.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    category: c.category,
    level: c.level,
    durationMin: c.durationMin,
    totalLessons: c._count.lessons,
    completedLessons: 0,
  }));

  const memberSince = (user?.createdAt ?? new Date()).toLocaleDateString(
    "en-US",
    { month: "short", year: "numeric" }
  );

  return (
    <StudentHome
      name={user?.name ?? session.user.name ?? "there"}
      status={session.user.status}
      role={session.user.role}
      memberSince={memberSince}
      enrolledCourses={enrolledCourses}
      latestCourses={latestCourses}
      totals={{
        enrolledCount: enrolledCourses.length,
        completedLessons: completions.length,
        totalLessons: enrolledLessonIds.length,
        catalogCount,
      }}
    />
  );
}
