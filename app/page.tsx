import {
  KoumianLanding,
  type CourseShow,
} from "@/components/public/KoumianLanding";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// The landing reads the live catalog (and auth) per request, so never
// prerender it at build (the DB isn't reachable during the build step).
export const dynamic = "force-dynamic";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default async function HomePage() {
  const session = await auth();

  // ─── LOGGED-IN: route to the right home ───
  if (session?.user) {
    // Admins → admin dashboard.
    if (session.user.role === "admin") redirect("/admin");
    // Approved students land straight on the community Feed (Facebook-style).
    if (session.user.status === "approved") redirect("/community");
    // Pending/rejected students → their dashboard, which shows the right notice.
    redirect("/dashboard");
  }

  // ─── LOGGED-OUT: Koumian Academy marketing landing ───
  // Pull the live catalog so the landing's course grid matches /courses.
  // Falls back to a showcase inside the component when the catalog is empty.
  let courses: CourseShow[] = [];
  try {
    const rows = await prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "asc" },
      take: 6,
      select: {
        slug: true,
        title: true,
        description: true,
        category: true,
        _count: { select: { lessons: true } },
      },
    });
    courses = rows.map((c, i) => ({
      roman: ROMAN[i] ?? String(i + 1),
      cat: c.category,
      title: c.title,
      desc:
        c.description.length > 120
          ? c.description.slice(0, 117) + "…"
          : c.description,
      lessons: `${c._count.lessons} Lesson${
        c._count.lessons === 1 ? "" : "s"
      }`,
      href: `/courses/${c.slug}`,
    }));
  } catch {
    courses = [];
  }

  return <KoumianLanding courses={courses} />;
}
