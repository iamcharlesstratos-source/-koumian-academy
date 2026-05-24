"use client";

import { useState } from "react";
import { FilterTabs } from "./FilterTabs";
import { CourseCard, type CourseCardData } from "./CourseCard";
import { EmptyState } from "./EmptyState";

const FILTERS = [
  { id: "all", label: "All courses" },
  { id: "business", label: "Business" },
  { id: "marketing", label: "Marketing" },
  { id: "finance", label: "Finance" },
];

export function Catalog({
  courses,
  isAdmin,
  showHeader = true,
  initialFilter = "all",
}: {
  courses: CourseCardData[];
  isAdmin: boolean;
  showHeader?: boolean;
  initialFilter?: string;
}) {
  const valid = FILTERS.some((f) => f.id === initialFilter)
    ? initialFilter
    : "all";
  const [active, setActive] = useState(valid);

  const filtered =
    active === "all" ? courses : courses.filter((c) => c.category === active);

  const isEmpty = courses.length === 0;

  return (
    <section id="catalog" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {showHeader && (
          <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
            <div>
              <span className="mb-3 inline-block text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
                The Catalog
              </span>
              <h2 className="text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
                Programs to elevate your craft
              </h2>
              <p className="mt-4 max-w-xl text-muted">
                Hand-picked courses across business, marketing, and finance.
                Filter by what matters to you.
              </p>
            </div>
            <FilterTabs filters={FILTERS} active={active} onChange={setActive} />
          </div>
        )}
        {!showHeader && (
          <div className="mb-8">
            <FilterTabs filters={FILTERS} active={active} onChange={setActive} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isEmpty ? (
            <EmptyState isAdmin={isAdmin} />
          ) : filtered.length === 0 ? (
            <EmptyState filtered />
          ) : (
            filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
