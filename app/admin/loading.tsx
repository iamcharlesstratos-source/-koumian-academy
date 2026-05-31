import { Skeleton } from "@/components/public/Skeleton";

// Shared admin loading skeleton (dashboard, users, courses all share the
// admin layout, so this covers the inner content while data loads).
export default function AdminLoading() {
  return (
    <div>
      <Skeleton className="mb-2 h-4 w-28" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 w-full rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
