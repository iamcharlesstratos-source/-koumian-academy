// Small reusable skeleton primitives used by route-level loading.tsx files.
// Pure presentational — theme-aware via `bg-current` opacity + a shimmer pulse.

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-current/[0.07] dark:bg-current/[0.06]",
        className
      )}
    />
  );
}

/** A course-card-shaped skeleton for catalog/dashboard grids. */
export function CourseCardSkeleton() {
  return (
    <div className="surface overflow-hidden rounded-2xl border border-theme">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="space-y-3 p-7">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex items-center justify-between border-t border-theme pt-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** A grid of course-card skeletons. */
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
