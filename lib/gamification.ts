import { prisma } from "@/lib/prisma";

// Point values for activity. Tunable in one place.
export const POINTS = {
  lesson: 10,
  win: 15,
  post: 5,
  comment: 2,
} as const;

export type GameStats = {
  points: number;
  streak: number; // consecutive days with a completed lesson
  lessons: number;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  points: number;
  lessons: number;
};

/** Current consecutive-day streak (ending today or yesterday) from completion dates. */
export function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const days = new Set(dates.map((d) => d.toISOString().slice(0, 10)));

  const now = new Date();
  const cursor = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  // Allow the streak to still "count" if they haven't done one *today* yet,
  // as long as yesterday is present.
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Points + streak for a single user. Safe (returns zeros) on any error. */
export async function getUserGameStats(userId: string): Promise<GameStats> {
  try {
    const [completions, feedCount, winCount, commentCount] = await Promise.all([
      prisma.lessonCompletion.findMany({
        where: { userId },
        select: { completedAt: true },
      }),
      prisma.post.count({ where: { authorId: userId, type: "feed" } }),
      prisma.post.count({ where: { authorId: userId, type: "win" } }),
      prisma.comment.count({ where: { authorId: userId } }),
    ]);
    const lessons = completions.length;
    const points =
      lessons * POINTS.lesson +
      winCount * POINTS.win +
      feedCount * POINTS.post +
      commentCount * POINTS.comment;
    return { points, streak: computeStreak(completions.map((c) => c.completedAt)), lessons };
  } catch {
    return { points: 0, streak: 0, lessons: 0 };
  }
}

/** Ranked leaderboard of approved students by points. */
export async function getLeaderboard(limit = 25): Promise<LeaderboardEntry[]> {
  try {
    const [completionsByUser, postsByUser, commentsByUser, users] =
      await Promise.all([
        prisma.lessonCompletion.groupBy({ by: ["userId"], _count: true }),
        prisma.post.groupBy({ by: ["authorId", "type"], _count: true }),
        prisma.comment.groupBy({ by: ["authorId"], _count: true }),
        prisma.user.findMany({
          where: { status: "approved", role: { not: "admin" } },
          select: { id: true, name: true, image: true },
        }),
      ]);

    const acc = new Map<string, { points: number; lessons: number }>();
    const bump = (id: string) => {
      let e = acc.get(id);
      if (!e) {
        e = { points: 0, lessons: 0 };
        acc.set(id, e);
      }
      return e;
    };
    for (const c of completionsByUser) {
      const e = bump(c.userId);
      e.lessons = c._count;
      e.points += c._count * POINTS.lesson;
    }
    for (const p of postsByUser) {
      bump(p.authorId).points += p._count * (p.type === "win" ? POINTS.win : POINTS.post);
    }
    for (const c of commentsByUser) {
      bump(c.authorId).points += c._count * POINTS.comment;
    }

    return users
      .map((u) => ({
        userId: u.id,
        name: u.name,
        image: u.image,
        points: acc.get(u.id)?.points ?? 0,
        lessons: acc.get(u.id)?.lessons ?? 0,
      }))
      .sort((a, b) => b.points - a.points || b.lessons - a.lessons)
      .slice(0, limit)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  } catch {
    return [];
  }
}
