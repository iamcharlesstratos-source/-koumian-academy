import { Skeleton } from "@/components/public/Skeleton";

export default function ProfileLoading() {
  return (
    <main className="px-6 pb-20 pt-32 sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
