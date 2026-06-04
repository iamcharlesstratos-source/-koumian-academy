import { Search } from "lucide-react";

// A lightweight global search box. Uses a native GET form so it works without
// client JS — submitting navigates to /search?q=… (a server-rendered results
// page). Placeholder/scope differ by role (admins also search members).
export function GlobalSearch({
  defaultValue = "",
  placeholder = "Search courses…",
  className = "",
}: {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <form action="/search" role="search" className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete="off"
          maxLength={80}
          aria-label="Search"
          className="input rounded-full pl-10 lg:pr-14"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center rounded border border-theme-strong bg-current/[0.04] px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted lg:inline-flex">
          ⌘K
        </kbd>
      </div>
    </form>
  );
}
