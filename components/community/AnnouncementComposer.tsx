"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Megaphone } from "lucide-react";
import { createAnnouncement } from "@/app/community/actions";

// Admin-only: post a new announcement to all members.
export function AnnouncementComposer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const result = await createAnnouncement({ title, body });
      if (result.ok) {
        setTitle("");
        setBody("");
        setOpen(false);
        toast.success("Announcement posted.");
      } else {
        toast.error(result.error);
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-primary w-full justify-center text-sm"
      >
        <Megaphone className="h-4 w-4" />
        New announcement
      </button>
    );
  }

  return (
    <div className="surface rounded-2xl border border-purple-soft/30 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-purple-600 dark:text-purple-300" />
        <h3 className="text-sm font-semibold text-fg">New announcement</h3>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={160}
        placeholder="Title"
        className="input mb-3"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={2000}
        placeholder="What do you want to tell your members?"
        className="input mb-3 resize-y"
      />
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border border-theme bg-current/[0.02] px-4 py-2 text-sm text-fg transition-colors hover:bg-current/[0.05]"
        >
          Cancel
        </button>
        <button onClick={submit} disabled={pending} className="btn-primary text-sm">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Post
        </button>
      </div>
    </div>
  );
}
