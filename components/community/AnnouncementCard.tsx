"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Megaphone, Trash2 } from "lucide-react";
import { deleteAnnouncement } from "@/app/community/actions";
import { timeAgo } from "@/lib/utils";

export type AnnouncementData = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  authorName: string | null;
  canDelete: boolean;
};

export function AnnouncementCard({ item }: { item: AnnouncementData }) {
  const [deleted, setDeleted] = useState(false);
  const [pending, startTransition] = useTransition();

  if (deleted) return null;

  const onDelete = () => {
    if (!confirm("Delete this announcement?")) return;
    startTransition(async () => {
      const result = await deleteAnnouncement(item.id);
      if (result.ok) {
        setDeleted(true);
        toast.success("Announcement deleted.");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <article className="surface rounded-2xl border border-theme p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-purple/10 ring-1 ring-purple-soft/25">
          <Megaphone className="h-4 w-4 text-purple-600 dark:text-purple-300" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-fg">
            {item.title}
          </h3>
          <p className="text-xs text-muted">
            {item.authorName ?? "Admin"} · {timeAgo(item.createdAt)}
          </p>
        </div>
        {item.canDelete && (
          <button
            onClick={onDelete}
            disabled={pending}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-300"
            title="Delete announcement"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-balance text-sm leading-relaxed text-muted">
        {item.body}
      </p>
    </article>
  );
}
