"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCheck,
  Trash2,
  ShieldCheck,
  MessageCircle,
  GraduationCap,
  Megaphone,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";
import { markAllRead, markRead, clearAll } from "@/app/notifications/actions";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

const ICON: Record<string, LucideIcon> = {
  approval: ShieldCheck,
  comment: MessageCircle,
  enrollment: GraduationCap,
  announcement: Megaphone,
  system: Bell,
};

export function NotificationList({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const [list, setList] = useState(items);
  const [pending, startTransition] = useTransition();

  const hasUnread = list.some((n) => !n.read);

  const open = (n: NotificationItem) => {
    if (!n.read) {
      setList((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      startTransition(async () => {
        await markRead(n.id);
        router.refresh();
      });
    }
    if (n.link) router.push(n.link);
  };

  const onMarkAll = () => {
    setList((l) => l.map((x) => ({ ...x, read: true })));
    startTransition(async () => {
      await markAllRead();
      router.refresh();
    });
  };

  const onClear = () => {
    if (!confirm("Clear all notifications?")) return;
    setList([]);
    startTransition(async () => {
      const r = await clearAll();
      if (r.ok) toast.success("Notifications cleared.");
      router.refresh();
    });
  };

  if (list.length === 0) {
    return (
      <div className="surface flex flex-col items-center justify-center rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 ring-4 ring-purple/5">
          <Bell className="h-6 w-6 text-purple-500 dark:text-purple-300" />
        </span>
        <h3 className="text-lg font-semibold text-fg">You&apos;re all caught up</h3>
        <p className="mt-2 max-w-sm text-balance text-muted">
          Approvals, comments on your posts, new courses, and announcements will
          show up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          onClick={onMarkAll}
          disabled={pending || !hasUnread}
          className="inline-flex items-center gap-1.5 rounded-lg border border-theme bg-current/[0.02] px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-purple-soft/40 disabled:opacity-40"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark all read
        </button>
        <button
          onClick={onClear}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-theme bg-current/[0.02] px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-rose-500 disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all
        </button>
      </div>

      <ul className="space-y-2">
        {list.map((n) => {
          const Icon = ICON[n.type] ?? Bell;
          return (
            <li key={n.id}>
              <button
                onClick={() => open(n)}
                className={cn(
                  "surface flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:border-purple-soft/40",
                  n.read ? "border-theme" : "border-purple-soft/40 bg-purple/[0.04]"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
                    n.read
                      ? "bg-current/5 text-muted"
                      : "bg-purple/15 text-purple-600 dark:text-purple-300"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-fg">{n.title}</span>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple" />
                    )}
                  </div>
                  {n.body && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
