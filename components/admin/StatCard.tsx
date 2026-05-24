import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  progress,
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  progress?: number; // 0–100
}) {
  return (
    <div className="surface rounded-2xl border border-theme p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">
            {value}
          </p>
          {trend && (
            <p className="mt-1 text-xs text-purple-600 dark:text-purple-300">
              {trend}
            </p>
          )}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple/10">
          <Icon className="h-5 w-5 text-purple-600 dark:text-purple-200" />
        </span>
      </div>
      {progress !== undefined && (
        <div className="mt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-current/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-deep to-purple shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
