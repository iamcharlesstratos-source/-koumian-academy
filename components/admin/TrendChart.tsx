// A dependency-free SVG area/line trend chart. Stretches to its container
// width (preserveAspectRatio="none") with a non-scaling stroke so the line
// stays crisp at any width. No dots (they'd distort under non-uniform scale).
const VARIANTS = {
  indigo: { stroke: "#7C3AED", fill: "rgba(124,58,237,0.28)" },
  emerald: { stroke: "#10B981", fill: "rgba(16,185,129,0.28)" },
  amber: { stroke: "#F59E0B", fill: "rgba(245,158,11,0.28)" },
  sky: { stroke: "#0EA5E9", fill: "rgba(14,165,233,0.28)" },
} as const;

export function TrendChart({
  points,
  variant = "indigo",
  height = 140,
}: {
  points: { label: string; value: number }[];
  variant?: keyof typeof VARIANTS;
  height?: number;
}) {
  const W = 600;
  const H = 200;
  const padX = 6;
  const padY = 18;
  const n = points.length;
  const max = Math.max(1, ...points.map((p) => p.value));
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const coords = points.map((p, i) => {
    const x = padX + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = padY + innerH - (p.value / max) * innerH;
    return { x, y };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const baseline = (padY + innerH).toFixed(1);
  const area =
    coords.length > 0
      ? `${line} L${coords[n - 1].x.toFixed(1)},${baseline} L${coords[0].x.toFixed(
          1
        )},${baseline} Z`
      : "";

  const c = VARIANTS[variant];
  const gid = `trend-grad-${variant}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.fill} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {area && <path d={area} fill={`url(#${gid})`} />}
        <path
          d={line}
          fill="none"
          stroke={c.stroke}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-muted">
        {points.map((p, i) => (
          <span
            key={i}
            className={
              i === 0 || i === n - 1 || i === Math.floor((n - 1) / 2)
                ? ""
                : "hidden sm:inline"
            }
          >
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
