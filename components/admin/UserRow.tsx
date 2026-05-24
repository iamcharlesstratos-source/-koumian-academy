"use client";

import { useState, useTransition } from "react";
import {
  Check,
  X,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Shield,
} from "lucide-react";
import {
  setUserStatus,
  setUserRole,
  grantCourseAccess,
  revokeCourseAccess,
} from "@/app/admin/users/actions";
import { cn } from "@/lib/utils";

type CourseLite = { id: string; title: string; category: string };

type UserData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  status: string;
  createdAt: Date;
  enrolledCourseIds: string[];
};

export function UserRow({
  user,
  courses,
  isSelf,
}: {
  user: UserData;
  courses: CourseLite[];
  isSelf: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="surface overflow-hidden rounded-xl border border-theme transition-colors hover:border-theme-strong">
      <div className="flex flex-col items-stretch gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple/15 text-sm text-purple-700 dark:text-purple-200">
              {user.name?.[0] ?? "?"}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-fg">
                {user.name ?? "Unknown"}
              </span>
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-soft/30 bg-purple/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-purple-700 dark:text-purple-200">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Admin
                </span>
              )}
              {isSelf && (
                <span className="text-[9px] uppercase tracking-wider text-muted">
                  (you)
                </span>
              )}
            </div>
            <div className="truncate text-xs text-muted">{user.email}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <StatusPill status={user.status} />
          <div className="flex items-center gap-1.5">
            {user.status !== "approved" && (
              <button
                disabled={pending || isSelf}
                onClick={() =>
                  startTransition(() => setUserStatus(user.id, "approved"))
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
            )}
            {user.status !== "rejected" && (
              <button
                disabled={pending || isSelf}
                onClick={() =>
                  startTransition(() => setUserStatus(user.id, "rejected"))
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </button>
            )}
            <button
              disabled={pending || isSelf}
              onClick={() =>
                startTransition(() =>
                  setUserRole(user.id, user.role === "admin" ? "user" : "admin")
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-theme bg-current/[0.02] px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-purple-soft/40 hover:bg-purple/[0.08] disabled:opacity-40"
              title={
                user.role === "admin" ? "Demote to user" : "Promote to admin"
              }
            >
              {user.role === "admin" ? (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  Demote
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Make admin
                </>
              )}
            </button>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-theme bg-current/[0.02] px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-current/[0.05]"
          >
            Course access
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                expanded && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-theme bg-current/[0.02] p-5">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            Course access ({user.enrolledCourseIds.length} of {courses.length})
          </p>
          {courses.length === 0 ? (
            <p className="rounded-lg border border-dashed border-theme-strong px-3 py-4 text-center text-xs text-muted">
              Create courses first to grant access.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {courses.map((c) => {
                const enrolled = user.enrolledCourseIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    disabled={pending}
                    onClick={() =>
                      startTransition(() =>
                        enrolled
                          ? revokeCourseAccess(user.id, c.id)
                          : grantCourseAccess(user.id, c.id)
                      )
                    }
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-xs transition-all disabled:opacity-50",
                      enrolled
                        ? "border-purple-soft/40 bg-purple/10 text-fg hover:bg-purple/15"
                        : "border-theme bg-current/[0.02] text-muted hover:border-theme-strong hover:text-fg"
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <div className="truncate font-medium">{c.title}</div>
                      <div className="text-[10px] uppercase tracking-wider opacity-60">
                        {c.category}
                      </div>
                    </span>
                    <span
                      className={cn(
                        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border",
                        enrolled
                          ? "border-purple bg-purple text-white"
                          : "border-theme-strong"
                      )}
                    >
                      {enrolled && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {pending && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const config =
    {
      approved:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
      pending:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
      rejected:
        "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30",
    }[status] ?? "bg-current/5 text-muted border-theme";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${config}`}
    >
      {status}
    </span>
  );
}
