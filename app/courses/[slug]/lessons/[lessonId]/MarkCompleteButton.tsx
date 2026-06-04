"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleLessonComplete } from "./actions";

export function MarkCompleteButton({
  lessonId,
  initialCompleted,
}: {
  lessonId: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const click = () => {
    startTransition(async () => {
      const result = await toggleLessonComplete(lessonId);
      if (result.ok) {
        setCompleted(result.completed);
        // Refresh the server component so the sidebar progress bar and the
        // "Course complete → certificate" banner update in place.
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <button
      onClick={click}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.98]",
        completed
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/15"
          : "border-purple bg-purple text-white hover:shadow-[0_0_25px_rgba(99,102,241,0.45)]"
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
  );
}
