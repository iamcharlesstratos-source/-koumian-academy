"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export function CertificateActions({ backHref }: { backHref: string }) {
  return (
    <div className="no-print mx-auto mb-8 flex max-w-4xl flex-wrap items-center justify-between gap-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>
      <button
        onClick={() => window.print()}
        className="btn-primary"
        type="button"
      >
        <Printer className="h-4 w-4" />
        Print / Save as PDF
      </button>
    </div>
  );
}
