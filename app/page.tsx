import { Nav } from "@/components/public/Nav";
import { Hero } from "@/components/public/Hero";
import { StatsStrip } from "@/components/public/StatsStrip";
import { Categories } from "@/components/public/Categories";
import { Skills } from "@/components/public/Skills";
import { Roadmap } from "@/components/public/Roadmap";
import { Testimonials } from "@/components/public/Testimonials";
import { WordmarkBand } from "@/components/public/WordmarkBand";
import { About } from "@/components/public/About";
import { FinalCTA } from "@/components/public/FinalCTA";
import { Footer } from "@/components/public/Footer";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

  // ─── LOGGED-OUT: Marketing landing page ───
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
        <WordmarkBand />
        <About />
        <FinalCTA signedIn={false} />
      </main>
      <Footer signedIn={false} />
    </>
  );
}
