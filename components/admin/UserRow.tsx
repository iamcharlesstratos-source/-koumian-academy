"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Check,
  X,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Shield,
  KeyRound,
  Copy,
} from "lucide-react";
import {
  setUserStatus,
  setUserRole,
  grantCourseAccess,
  revokeCourseAccess,
  resetUserPassword,
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
  const [resetResult, setResetResult] = useState<{
    tempPassword: string;
  } | null>(null);

  const handleApprove = () =>
    startTransition(async () => {
      await setUserStatus(user.id, "approved");
      toast.success(`${user.name ?? user.email} approved.`);
    });

  const handleReject = () =>
    startTransition(async () => {
      await setUserStatus(user.id, "rejected");
      toast.success(`${user.name ?? user.email} rejected.`);
    });

  const handleRole = () =>
    startTransition(async () => {
      const next = user.role === "admin" ? "user" : "admin";
      await setUserRole(user.id, next);
      toast.success(
        next === "admin" ? "Promoted to admin." : "Demoted to user."
      );
    });

  const handleReset = () => {
    if (
      !confirm(
        `Reset password for ${user.name ?? user.email}? A new temporary password will be generated.`
      )
    )
      return;
    startTransition(async () => {
      const result = await resetUserPassword(user.id);
      if (result.ok) {
        setResetResult({ tempPassword: result.tempPassword });
        toast.success("Password reset. Copy the temporary password below.");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="surface overflow-hidden rounded-xl border border-theme transition-colors hover:border-theme-strong">
      <div className="flex flex-col items-stretch gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              referrerPolicy="no-referrer"
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
          <div className="flex flex-wrap items-center gap-1.5">
            {user.status !== "approved" && (
              <button
                disabled={pending || isSelf}
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
            )}
            {user.status !== "rejected" && (
              <button
                disabled={pending || isSelf}
                onClick={handleReject}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </button>
            )}
            <button
              disabled={pending || isSelf}
              onClick={handleRole}
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
            <button
              disabled={pending}
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-theme bg-current/[0.02] px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-purple-soft/40 hover:bg-purple/[0.08] disabled:opacity-40"
              title="Generate a new temporary password"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Reset PW
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

      {resetResult && (
        <div className="border-t border-theme bg-purple/[0.04] p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-purple-600 dark:text-purple-300" />
            <p className="text-sm font-medium text-fg">
              Temporary password generated
            </p>
          </div>
          <p className="mt-1 text-xs text-muted">
            Share this with {user.name ?? user.email}. They can use it to sign
            in. It won&apos;t be shown again.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-theme bg-current/[0.03] px-4 py-2.5 font-mono text-sm text-fg">
              {resetResult.tempPassword}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(resetResult.tempPassword);
                toast.success("Copied to clipboard.");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-theme-strong bg-current/[0.02] px-3 py-2.5 text-xs font-medium text-fg transition-colors hover:bg-current/[0.06]"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
            <button
              onClick={() => setResetResult(null)}
              className="rounded-lg border border-theme-strong bg-current/[0.02] p-2.5 text-muted transition-colors hover:text-fg"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

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
                      startTransition(async () => {
                        if (enrolled) {
                          await revokeCourseAccess(user.id, c.id);
                          toast.success(`Revoked access to "${c.title}".`);
                        } else {
                          await grantCourseAccess(user.id, c.id);
                          toast.success(`Granted access to "${c.title}".`);
                        }
                      })
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
