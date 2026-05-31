import { Nav } from "@/components/public/Nav";
import { Hero } from "@/components/public/Hero";
import { StatsStrip } from "@/components/public/StatsStrip";
import { Categories } from "@/components/public/Categories";
import { Skills } from "@/components/public/Skills";
import { Roadmap } from "@/components/public/Roadmap";
import { Testimonials } from "@/components/public/Testimonials";
import { About } from "@/components/public/About";
import { FinalCTA } from "@/components/public/FinalCTA";
import { Footer } from "@/components/public/Footer";
import { StudentHome, type StudentCourse } from "@/components/student/StudentHome";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // Admins go straight to the admin dashboard — that's their home.
  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  // ─── LOGGED-IN VIEW: Student dashboard ───
  if (session?.user) {
    const userId = session.user.id;

    const [user, enrollments, latest, catalogCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              lessons: {
                where: { published: true }, // Only count published lessons toward progress
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
        include: {
          _count: { select: { lessons: true } },
        },
      }),
      prisma.course.count({ where: { published: true } }),
    ]);

    // Pull all lessonIds belonging to enrolled courses to count completions
    const enrolledLessonIds = enrollments.flatMap((e) =>
      e.course.lessons.map((l) => l.id)
    );
    const completions = enrolledLessonIds.length
      ? await prisma.lessonCompletion.findMany({
          where: {
            userId,
            lessonId: { in: enrolledLessonIds },
          },
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
      <>
        <Nav user={session.user} />
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
        <Footer signedIn />
      </>
    );
  }

  // ─── LOGGED-OUT VIEW: Marketing landing page ───
  const [coursesCount, memberCount] = await Promise.all([
    prisma.course.count({ where: { published: true } }),
    prisma.user.count({ where: { status: "approved" } }),
  ]);

  const stats = [
    { value: String(coursesCount), label: "Courses" },
    { value: String(memberCount), label: "Members" },
    { value: "★ 4.9", label: "Rating" },
    { value: "Lifetime", label: "Access" },
  ];

  return (
    <>
      <Nav user={null} />
      <main>
        <Hero />
        <StatsStrip stats={stats} />
        <Categories />
        <Skills />
        <Roadmap />
        <Testimonials />
        <About />
        <FinalCTA signedIn={false} />
      </main>
      <Footer signedIn={false} />
    </>
  );
}
