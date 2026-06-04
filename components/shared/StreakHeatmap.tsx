// A GitHub-style activity heatmap. Purely presentational: the parent computes
// the day cells (oldest → newest) on the server, so there's no date logic or
// client state here. Cells are grouped into vertical weeks (7 rows each).
function tier(count: number): string {
  if (count <= 0) return "bg-current/[0.06]";
  if (count === 1) return "bg-purple/30";
  if (count <= 3) return "bg-purple/60";
  return "bg-purple";
}

export function StreakHeatmap({
  days,
}: {
  days: { key: string; count: number }[];
}) {
  // Split the flat day list into columns of 7 (one column = one week).
  const weeks: { key: string; count: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  const activeDays = days.filter((d) => d.count > 0).length;

  return (
    <div>
      <div className="flex items-end gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((d) => (
              <span
                key={d.key}
                title={`${d.key} · ${d.count} lesson${d.count === 1 ? "" : "s"}`}
                className={`h-3 w-3 rounded-[3px] ${tier(d.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
        <span>{activeDays} active days</span>
        <span className="flex items-center gap-1.5">
          Less
          <span className="h-2.5 w-2.5 rounded-[3px] bg-current/[0.06]" />
          <span className="h-2.5 w-2.5 rounded-[3px] bg-purple/30" />
          <span className="h-2.5 w-2.5 rounded-[3px] bg-purple/60" />
          <span className="h-2.5 w-2.5 rounded-[3px] bg-purple" />
          More
        </span>
      </div>
    </div>
  );
}
