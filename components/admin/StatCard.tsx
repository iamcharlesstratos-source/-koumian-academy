import { LucideIcon } from "lucide-react";

export type StatTone = "indigo" | "emerald" | "amber" | "sky" | "rose";

const TONES: Record<
  StatTone,
  { tile: string; icon: string; trend: string; bar: string }
> = {
  indigo: {
    tile: "bg-purple/10",
    icon: "text-purple-600 dark:text-purple-300",
    trend: "text-purple-600 dark:text-purple-300",
    bar: "from-purple-deep to-purple",
  },
  emerald: {
    tile: "bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-300",
    trend: "text-emerald-600 dark:text-emerald-300",
    bar: "from-emerald-600 to-emerald-400",
  },
  amber: {
    tile: "bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-300",
    trend: "text-amber-600 dark:text-amber-300",
    bar: "from-amber-500 to-amber-400",
  },
  sky: {
    tile: "bg-sky-500/10",
    icon: "text-sky-600 dark:text-sky-300",
    trend: "text-sky-600 dark:text-sky-300",
    bar: "from-sky-600 to-sky-400",
  },
  rose: {
    tile: "bg-rose-500/10",
    icon: "text-rose-600 dark:text-rose-300",
    trend: "text-rose-600 dark:text-rose-300",
    bar: "from-rose-600 to-rose-400",
  },
};

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  progress,
  tone = "indigo",
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  progress?: number; // 0–100
  tone?: StatTone;
}) {
  const t = TONES[tone];
  return (
    <div className="surface rounded-2xl border border-theme p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">
            {value}
          </p>
          {trend && <p className={`mt-1 text-xs ${t.trend}`}>{trend}</p>}
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.tile}`}
        >
          <Icon className={`h-5 w-5 ${t.icon}`} />
        </span>
      </div>
      {progress !== undefined && (
        <div className="mt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-current/[0.06]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${t.bar} transition-all duration-700`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
