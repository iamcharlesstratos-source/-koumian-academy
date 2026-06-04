import { cn } from "@/lib/utils";

// A lightweight SVG circular progress ring. No client hooks — safe to render
// from server or client components. Colors are driven by text-color utility
// classes (the <circle> uses stroke="currentColor"), so it adapts to context
// (e.g. white-on-gradient vs indigo-on-surface).
export function ProgressRing({
  value,
  size = 44,
  stroke = 4,
  trackClass = "text-current/15",
  barClass = "text-purple",
  labelClass = "text-fg",
  showLabel = true,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  trackClass?: string;
  barClass?: string;
  labelClass?: string;
  showLabel?: boolean;
  children?: React.ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <span
      className="relative inline-flex flex-shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          className={trackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          className={cn("transition-[stroke-dashoffset] duration-700", barClass)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {children ? (
        <span className="absolute inset-0 flex items-center justify-center">
          {children}
        </span>
      ) : (
        showLabel && (
          <span
            className={cn(
              "absolute text-[10px] font-semibold tabular-nums",
              labelClass
            )}
          >
            {pct}%
          </span>
        )
      )}
    </span>
  );
}
