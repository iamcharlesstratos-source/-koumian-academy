"use client";

// Global error boundary — catches any uncaught server/runtime error in the
// app tree and shows a branded fallback instead of the raw Next.js overlay.
// See: https://nextjs.org/docs/app/api-reference/file-conventions/error

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to server console — visible in Netlify function logs.
    // eslint-disable-next-line no-console
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="surface rounded-2xl border border-theme p-10 backdrop-blur-sm shadow-2xl">
          <span className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 ring-4 ring-rose-500/5">
            <AlertTriangle className="h-6 w-6 text-rose-500 dark:text-rose-300" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Something went wrong
          </h1>
          <p className="mt-3 text-balance text-muted">
            We hit an unexpected error. The team has been notified. Try again, or
            head back to the homepage.
          </p>

          {error.digest && (
            <p className="mt-4 inline-block rounded-full border border-theme bg-current/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
              Error ID: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={reset} className="btn-primary">
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <Link href="/" className="btn-secondary">
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
