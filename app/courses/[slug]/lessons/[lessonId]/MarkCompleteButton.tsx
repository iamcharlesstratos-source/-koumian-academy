"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRight,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleLessonComplete } from "./actions";

const CONFETTI_COLORS = ["#7C3AED", "#C4B5FD", "#F59E0B", "#10B981", "#FFFFFF"];

function celebrate(big: boolean) {
  const base = {
    zIndex: 9999,
    colors: CONFETTI_COLORS,
    startVelocity: big ? 55 : 38,
    spread: big ? 110 : 65,
    ticks: big ? 220 : 110,
  };
  confetti({ ...base, particleCount: big ? 150 : 60, origin: { y: 0.7 } });
  if (big) {
    // Side cannons for the course-complete moment.
    setTimeout(
      () => confetti({ ...base, particleCount: 70, angle: 60, origin: { x: 0, y: 0.85 } }),
      150
    );
    setTimeout(
      () => confetti({ ...base, particleCount: 70, angle: 120, origin: { x: 1, y: 0.85 } }),
      300
    );
  }
}

export function MarkCompleteButton({
  lessonId,
  initialCompleted,
  nextHref,
  completesCourse = false,
  certificateHref,
}: {
  lessonId: string;
  initialCompleted: boolean;
  nextHref?: string | null;
  completesCourse?: boolean;
  certificateHref?: string;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [finishedCourse, setFinishedCourse] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const click = () => {
    const wasCompleted = completed;
    startTransition(async () => {
      const result = await toggleLessonComplete(lessonId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setCompleted(result.completed);
      // Celebrate only on a fresh completion (not when un-marking).
      if (result.completed && !wasCompleted) {
        celebrate(completesCourse);
        if (completesCourse) {
          setFinishedCourse(true);
          toast.success("🎉 Course complete! Your certificate is ready.");
        } else {
          toast.success("Lesson complete — nice work! 🎯");
        }
      }
      // Refresh so the sidebar progress + course-complete banner update.
      router.refresh();
    });
  };

  const showCertCta = !!certificateHref && finishedCourse;
  const showNextCta = completed && !!nextHref && !finishedCourse;

  return (
    <div className="flex flex-col items-end gap-3">
      <button
        onClick={click}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.98]",
          completed
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/15"
            : "border-purple bg-purple text-white hover:shadow-[0_0_25px_rgba(124,58,237,0.45)]"
        )}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
        {completed ? "Completed" : "Mark as complete"}
      </button>

      {showCertCta && (
        <Link
          href={certificateHref!}
          className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-200"
        >
          <Award className="h-4 w-4" />
          Get your certificate
        </Link>
      )}

      {showNextCta && (
        <Link
          href={nextHref!}
          className="inline-flex items-center gap-1.5 text-sm text-purple-600 transition-opacity hover:opacity-80 dark:text-purple-300"
        >
          Next lesson
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
