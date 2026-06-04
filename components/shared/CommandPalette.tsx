"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  User as UserIcon,
  CornerDownLeft,
  Loader2,
} from "lucide-react";

type Course = { id: string; slug: string; title: string; category: string };
type Member = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};
type Item =
  | { kind: "course"; href: string; title: string; sub: string }
  | { kind: "member"; href: string; title: string; sub: string; image: string | null };

export function CommandPalette({ role }: { role: string }) {
  const isAdmin = role === "admin";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K to toggle; Escape handled on the input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus the input + reset when opening.
  useEffect(() => {
    if (open) {
      setActive(0);
      // focus after paint
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
    setQ("");
    setItems([]);
    setLoading(false);
  }, [open]);

  // Debounced fetch as the query changes.
  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (!query) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as {
          courses: Course[];
          members: Member[];
        };
        const next: Item[] = [
          ...data.courses.map((c) => ({
            kind: "course" as const,
            href: `/courses/${c.slug}`,
            title: c.title,
            sub: c.category,
          })),
          ...data.members.map((m) => ({
            kind: "member" as const,
            href: "/admin/users",
            title: m.name ?? "Member",
            sub: m.email,
            image: m.image,
          })),
        ];
        setItems(next);
        setActive(0);
      } catch {
        /* aborted or failed — ignore */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [q, open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(0, items.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[active]) go(items[active].href);
      else if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Koumian"
        className="surface w-full max-w-lg overflow-hidden rounded-2xl border border-theme-strong shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-theme px-4">
          <Search className="h-4 w-4 flex-shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={
              isAdmin ? "Search courses & members…" : "Search courses…"
            }
            maxLength={80}
            className="w-full bg-transparent py-3.5 text-sm text-fg outline-none placeholder:text-muted"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim() === "" ? (
            <p className="px-3 py-6 text-center text-xs text-muted">
              Type to search{isAdmin ? " courses and members" : " courses"}.
            </p>
          ) : items.length === 0 && !loading ? (
            <p className="px-3 py-6 text-center text-xs text-muted">
              No matches for “{q.trim()}”.
            </p>
          ) : (
            <ul>
              {items.map((it, i) => (
                <li key={`${it.kind}-${i}`}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(it.href)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      i === active ? "bg-purple/10" : "hover:bg-current/5"
                    }`}
                  >
                    {it.kind === "member" && it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-7 w-7 flex-shrink-0 rounded-full"
                      />
                    ) : (
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-purple/10 text-purple-600 dark:text-purple-300">
                        {it.kind === "course" ? (
                          <BookOpen className="h-4 w-4" />
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-fg">
                        {it.title}
                      </span>
                      <span className="block truncate text-[11px] capitalize text-muted">
                        {it.sub}
                      </span>
                    </span>
                    {i === active && (
                      <CornerDownLeft className="h-3.5 w-3.5 flex-shrink-0 text-muted" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-theme px-4 py-2 text-[10px] text-muted">
          <span>↑↓ to navigate · ↵ to open · esc to close</span>
          <span className="hidden sm:inline">⌘K</span>
        </div>
      </div>
    </div>
  );
}
