"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ShieldCheck,
  MessageCircle,
  GraduationCap,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";
import type { RecentNotification } from "@/lib/notify";
import { markAllRead, markRead } from "@/app/notifications/actions";

const ICON: Record<string, LucideIcon> = {
  approval: ShieldCheck,
  comment: MessageCircle,
  enrollment: GraduationCap,
  announcement: Megaphone,
  system: Bell,
};

export function NotificationBell({
  items,
  unreadCount,
  className,
}: {
  items: RecentNotification[];
  unreadCount: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(items);
  const [count, setCount] = useState(unreadCount);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keep in sync when the server re-fetches on navigation.
  useEffect(() => {
    setList(items);
    setCount(unreadCount);
  }, [items, unreadCount]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const openItem = (n: RecentNotification) => {
    setOpen(false);
    if (!n.read) {
      setList((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setCount((c) => Math.max(0, c - 1));
      markRead(n.id).then(() => router.refresh());
    }
    if (n.link) router.push(n.link);
  };

  const onMarkAll = () => {
    setList((l) => l.map((x) => ({ ...x, read: true })));
    setCount(0);
    markAllRead().then(() => router.refresh());
  };

  return (
    <div ref={ref} className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-theme-strong nav-bg text-muted backdrop-blur-sm transition-all hover:border-purple-soft/40 hover:text-fg"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-purple px-1 text-[9px] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="surface absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-theme shadow-2xl">
          <div className="flex items-center justify-between border-b border-theme px-4 py-3">
            <span className="text-sm font-semibold text-fg">Notifications</span>
            {list.some((n) => !n.read) && (
              <button
                onClick={onMarkAll}
                className="inline-flex items-center gap-1 text-[11px] text-purple-600 transition-colors hover:opacity-80 dark:text-purple-300"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
            {list.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted">
                No notifications yet.
              </div>
            ) : (
              <ul className="divide-y divide-current/5">
                {list.map((n) => {
                  const Icon = ICON[n.type] ?? Bell;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => openItem(n)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-purple/[0.05]",
                          !n.read && "bg-purple/[0.04]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                            n.read
                              ? "bg-current/5 text-muted"
                              : "bg-purple/15 text-purple-600 dark:text-purple-300"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-fg">
                            {n.title}
                          </span>
                          {n.body && (
                            <span className="mt-0.5 line-clamp-2 block text-xs text-muted">
                              {n.body}
                            </span>
                          )}
                          <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-muted">
                            {timeAgo(n.createdAt)}
                          </span>
                        </span>
                        {!n.read && (
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-theme px-4 py-2.5 text-center text-xs font-medium text-purple-600 transition-colors hover:bg-purple/[0.05] dark:text-purple-300"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
