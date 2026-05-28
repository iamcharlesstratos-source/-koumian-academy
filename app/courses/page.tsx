import { Nav } from "@/components/public/Nav";
import { Footer } from "@/components/public/Footer";
import { Catalog } from "@/components/public/Catalog";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Search } from "lucide-react";

export const metadata = {
  title: "Courses — Koumian Academy",
  description: "Browse all courses across business, marketing, and finance.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const session = await auth();
  const initialFilter = searchParams.cat ?? "all";
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      level: true,
      durationMin: true,
      priceCents: true,
      // Count only published lessons (drafts shouldn't inflate the count on the public catalog).
      _count: { select: { lessons: { where: { published: true } } } },
    },
  });

  const isAdmin = session?.user?.role === "admin";
  const cardData = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    category: c.category,
    level: c.level,
    durationMin: c.durationMin,
    priceCents: c.priceCents,
    lessonCount: c._count.lessons,
  }));

  return (
    <>
      <Nav user={session?.user ?? null} />
      <main>
        <section className="relative px-6 pb-12 pt-36 sm:pt-44">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-soft/30 bg-purple/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-purple-700 dark:text-purple-200">
              <Search className="h-3 w-3" />
              The Catalog
            </div>
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-6xl md:text-7xl">
              <span className="word-violet">All</span>{" "}
              <span className="word-lavender">Courses.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-lg text-muted">
              Browse every program in the Koumian Academy library. Filter by
              category to find what fits your goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
              <span>
                <span className="text-fg font-medium">{cardData.length}</span>{" "}
                {cardData.length === 1 ? "course" : "courses"} available
              </span>
              <span>
                <span className="text-fg font-medium">
                  {cardData.reduce((sum, c) => sum + (c.lessonCount ?? 0), 0)}
                </span>{" "}
                lessons total
              </span>
            </div>
          </div>
        </section>

        <Catalog
          courses={cardData}
          isAdmin={isAdmin}
          showHeader={false}
          initialFilter={initialFilter}
        />
      </main>
      <Footer signedIn={!!session?.user} />
    </>
  );
}
