"use client";

import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function EmptyState({
  isAdmin = false,
  filtered = false,
}: {
  isAdmin?: boolean;
  filtered?: boolean;
}) {
  if (filtered) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-theme-strong px-6 py-20 text-center"
      >
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple/10">
          <BookOpen className="h-5 w-5 text-purple-500 dark:text-purple-300" />
        </span>
        <h3 className="text-lg font-semibold text-fg">
          No courses in this category yet
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Try a different filter or check back soon — new programs are added regularly.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-theme-strong px-6 py-24 text-center"
    >
      <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
        <BookOpen className="h-7 w-7 text-purple-500 dark:text-purple-300" />
      </span>
      <h3 className="text-2xl font-semibold tracking-tight text-fg">
        No courses yet
      </h3>
      <p className="mt-2 max-w-md text-balance text-muted">
        {isAdmin
          ? "Your catalog is empty. Create your first course to get started."
          : "The catalog is being prepared. Check back soon for the first programs."}
      </p>
      {isAdmin && (
        <Link href="/admin/courses/new" className="btn-primary mt-7">
          <Plus className="h-4 w-4" />
          Create your first course
        </Link>
      )}
    </motion.div>
  );
}
