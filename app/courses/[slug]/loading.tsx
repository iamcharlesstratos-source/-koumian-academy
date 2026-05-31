import { Skeleton } from "@/components/public/Skeleton";

// Shown while a single course's data loads.
export default function CourseDetailLoading() {
  return (
    <main className="px-6 pb-20 pt-32 sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <Skeleton className="mb-6 h-4 w-32" />
        <Skeleton className="mb-10 aspect-[21/9] w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="space-y-5 md:col-span-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <div className="flex gap-4 pt-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="md:col-span-1">
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
        </div>
        <Skeleton className="mt-16 h-14 w-full rounded-2xl" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
