"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Users,
  Check,
  X,
  Trash2,
  Download,
  Loader2,
  CheckSquare,
} from "lucide-react";
import { UserRow } from "./UserRow";
import { bulkSetUserStatus, bulkDeleteUsers } from "@/app/admin/users/actions";

type RawUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  status: string;
  createdAt: Date;
  enrollments: { courseId: string }[];
};
type CourseLite = { id: string; title: string; category: string };

export function UsersManager({
  users,
  courses,
  currentUserId,
}: {
  users: RawUser[];
  courses: CourseLite[];
  currentUserId: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const clear = () => setSelected(new Set());

  const pendingUsers = users.filter((u) => u.status === "pending");
  const otherUsers = users.filter((u) => u.status !== "pending");

  const selectableIds = users
    .filter((u) => u.id !== currentUserId)
    .map((u) => u.id);
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(selectableIds));

  const runStatus = (status: string, label: string) => {
    const ids = [...selected];
    startTransition(async () => {
      const res = await bulkSetUserStatus(ids, status);
      if (res.ok) {
        toast.success(
          `${label} ${res.count} member${res.count === 1 ? "" : "s"}.${
            res.skipped ? ` (${res.skipped} skipped)` : ""
          }`
        );
        clear();
      } else {
        toast.error(res.error);
      }
    });
  };

  const runDelete = () => {
    const ids = [...selected];
    if (
      !confirm(
        `Permanently delete ${ids.length} selected member${
          ids.length === 1 ? "" : "s"
        }?\n\nThis removes their accounts and all their data. This cannot be undone.`
      )
    )
      return;
    startTransition(async () => {
      const res = await bulkDeleteUsers(ids);
      if (res.ok) {
        toast.success(`Deleted ${res.count} member${res.count === 1 ? "" : "s"}.`);
        clear();
      } else {
        toast.error(res.error);
      }
    });
  };

  const renderRow = (u: RawUser) => (
    <UserRow
      key={u.id}
      user={{
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        enrolledCourseIds: u.enrollments.map((e) => e.courseId),
      }}
      courses={courses}
      isSelf={u.id === currentUserId}
      selected={selected.has(u.id)}
      onToggleSelect={u.id === currentUserId ? undefined : toggle}
    />
  );

  return (
    <>
      {/* Top controls: select-all + CSV export */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={toggleAll}
          disabled={selectableIds.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-theme bg-current/[0.02] px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-purple-soft/40 hover:bg-purple/[0.06] disabled:opacity-40"
        >
          <CheckSquare className="h-3.5 w-3.5" />
          {allSelected ? "Clear selection" : "Select all"}
        </button>
        <a
          href="/admin/users/export"
          className="inline-flex items-center gap-2 rounded-lg border border-theme bg-current/[0.02] px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-purple-soft/40 hover:bg-purple/[0.06]"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </a>
      </div>

      {/* Bulk action bar — appears when something is selected */}
      {selected.size > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-soft/40 bg-purple/[0.08] p-3 backdrop-blur-md">
          <span className="px-2 text-sm font-medium text-fg">
            {selected.size} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
            <button
              disabled={pending}
              onClick={() => runStatus("approved", "Approved")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 disabled:opacity-40 dark:text-emerald-300"
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </button>
            <button
              disabled={pending}
              onClick={() => runStatus("rejected", "Rejected")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500/20 disabled:opacity-40 dark:text-rose-300"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </button>
            <button
              disabled={pending}
              onClick={runDelete}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
            <button
              onClick={clear}
              className="rounded-lg border border-theme-strong bg-current/[0.02] px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-fg"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {pendingUsers.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-fg">
              Pending review
              <span className="ml-2 text-muted">({pendingUsers.length})</span>
            </h2>
          </div>
          <div className="space-y-2.5">{pendingUsers.map(renderRow)}</div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600 dark:text-purple-300" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-fg">
            All members
            <span className="ml-2 text-muted">({otherUsers.length})</span>
          </h2>
        </div>
        {otherUsers.length === 0 ? (
          <div className="surface rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center">
            <p className="text-sm text-muted">
              No approved or rejected members yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">{otherUsers.map(renderRow)}</div>
        )}
      </section>
    </>
  );
}
