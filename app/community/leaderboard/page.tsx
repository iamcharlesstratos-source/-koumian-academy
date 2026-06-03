import { auth } from "@/auth";
import { Trophy, Flame, Star, BookOpen } from "lucide-react";
import { getLeaderboard, getUserGameStats, POINTS } from "@/lib/gamification";
import { cn } from "@/lib/utils";

export const metadata = { title: "Leaderboard — Koumian Academy" };

export default async function LeaderboardPage() {
  const session = await auth();
  const meId = session!.user.id;

  const [entries, myStats] = await Promise.all([
    getLeaderboard(25),
    getUserGameStats(meId),
  ]);

  const myRank = entries.find((e) => e.userId === meId)?.rank;

  const medal = (rank: number) =>
    rank === 1
      ? "text-amber-400"
      : rank === 2
      ? "text-slate-300"
      : rank === 3
      ? "text-amber-600"
      : "text-muted";

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
          Compete &amp; grow
        </p>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-fg">
          <Trophy className="h-7 w-7 text-amber-500 dark:text-amber-300" />
          Leaderboard
        </h1>
        <p className="mt-2 text-sm text-muted">
          Earn points by completing lessons ({POINTS.lesson}), sharing wins (
          {POINTS.win}), posting ({POINTS.post}), and commenting ({POINTS.comment}).
        </p>
      </header>

      {/* Your stats */}
      <div className="grid grid-cols-3 gap-3">
        <MyStat icon={Star} label="Your points" value={myStats.points} />
        <MyStat icon={Flame} label="Day streak" value={myStats.streak} />
        <MyStat
          icon={Trophy}
          label="Your rank"
          value={myRank ? `#${myRank}` : "—"}
        />
      </div>

      {entries.length === 0 ? (
        <div className="surface rounded-2xl border border-dashed border-theme-strong px-6 py-16 text-center text-muted">
          No activity yet. Complete a lesson or share a post to get on the board!
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => {
            const isMe = e.userId === meId;
            return (
              <li
                key={e.userId}
                className={cn(
                  "surface flex items-center gap-3 rounded-xl border p-3.5",
                  isMe ? "border-purple-soft/50 bg-purple/[0.06]" : "border-theme"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center text-sm font-bold",
                    medal(e.rank)
                  )}
                >
                  {e.rank <= 3 ? <Trophy className="h-5 w-5" /> : e.rank}
                </span>
                {e.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple/15 text-sm font-medium text-purple-700 dark:text-purple-200">
                    {e.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-fg">
                    {e.name ?? "Member"}
                    {isMe && <span className="ml-1 text-xs text-muted">(you)</span>}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted">
                    <BookOpen className="h-3 w-3" />
                    {e.lessons} lesson{e.lessons === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-fg">{e.points}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted">
                    pts
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function MyStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string | number;
}) {
  return (
    <div className="surface rounded-xl border border-theme p-4 text-center">
      <Icon className="mx-auto h-4 w-4 text-purple-600 dark:text-purple-300" />
      <div className="mt-1.5 text-2xl font-semibold text-fg">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  );
}
