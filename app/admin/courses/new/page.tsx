import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "@/components/admin/CourseForm";

export default function NewCoursePage() {
  return (
    <>
      <Link
        href="/admin/courses"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>
      <header className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
          New course
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-fg">
          Create a course
        </h1>
        <p className="mt-2 text-sm text-muted">
          Set up the basics now — you&apos;ll add lessons next.
        </p>
      </header>
      <CourseForm />
    </>
  );
}
