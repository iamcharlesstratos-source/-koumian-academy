import { CourseGridSkeleton, Skeleton } from "@/components/public/Skeleton";

// Shown instantly while the /courses page fetches from the database.
export default function CoursesLoading() {
  return (
    <main className="px-6 pb-20 pt-36 sm:pt-44">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="mb-4 h-7 w-40 rounded-full" />
        <Skeleton className="h-16 w-2/3 max-w-xl" />
        <Skeleton className="mt-6 h-5 w-full max-w-2xl" />
        <div className="mt-12">
          <div className="mb-8 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full" />
            ))}
          </div>
          <CourseGridSkeleton count={6} />
        </div>
      </div>
    </main>
  );
}
