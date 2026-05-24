"use client";

import { cn } from "@/lib/utils";

type Filter = { id: string; label: string };

export function FilterTabs({
  filters,
  active,
  onChange,
}: {
  filters: Filter[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={cn(
            "pill",
            active === f.id ? "pill-active" : "pill-inactive"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
