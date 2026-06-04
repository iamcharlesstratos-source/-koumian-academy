"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  durationMin: number;
  priceCents: number;
  lessonCount?: number;
  coverImageUrl?: string | null;
};

// Stable gradient per category so cards without a cover image still look intentional.
const CATEGORY_GRADIENT: Record<string, string> = {
  business: "from-purple-700 to-indigo-600",
  marketing: "from-violet-700 to-fuchsia-600",
  finance: "from-purple-600 to-purple-900",
};

export function CourseCard({
  course,
  index = 0,
}: {
  course: CourseCardData;
  index?: number;
}) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay: index * 0.07,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link href={`/courses/${course.slug}`} className="group block h-full">
        <div
          onMouseMove={handleMouseMove}
          className="card-glow surface flex h-full flex-col overflow-hidden rounded-2xl border border-theme backdrop-blur-sm transition-all duration-300 hover:border-purple-soft/40"
        >
          {/* Cover image or category gradient */}
          <div
            className={`relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br ${
              CATEGORY_GRADIENT[course.category] ??
              "from-purple-700 to-purple-500"
            }`}
          >
            {course.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.coverImageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
            )}
            <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              {course.category}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-7">
            <h3 className="mb-3 text-xl font-semibold leading-snug tracking-tight text-fg transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-100">
              {course.title}
            </h3>

            <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted">
              {course.description}
            </p>

            <div className="mt-auto flex items-center justify-between border-t border-theme pt-5">
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-purple-500 dark:text-purple-300" />
                <span className="capitalize">{course.level}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-purple-500 dark:text-purple-300" />
                {formatDuration(course.durationMin)}
              </span>
            </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-theme-strong text-fg transition-all duration-300 group-hover:border-purple group-hover:bg-purple group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-12" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
