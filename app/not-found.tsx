import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Logo } from "@/components/public/Logo";

// Branded 404 page — shown for any unmatched route or when `notFound()` is
// called from a server component (e.g. course not found by slug).
// See: https://nextjs.org/docs/app/api-reference/file-conventions/not-found

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-10 flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="surface rounded-2xl border border-theme p-10 backdrop-blur-sm shadow-2xl">
          <span className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
            <Compass className="h-6 w-6 text-purple-600 dark:text-purple-300" />
          </span>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            404
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
            Page not found
          </h1>
          <p className="mt-3 text-balance text-muted">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved. Let&apos;s get you back on track.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary">
              <Home className="h-4 w-4" />
              Back to home
            </Link>
            <Link href="/courses" className="btn-secondary">
              Browse courses
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
