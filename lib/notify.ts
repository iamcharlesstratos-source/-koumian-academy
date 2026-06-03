import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "approval"
  | "comment"
  | "enrollment"
  | "announcement"
  | "system";

type NotifyInput = {
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
};

/**
 * Create one in-app notification for a single recipient. Best-effort: a
 * failure here (e.g. the Notification table not migrated yet) must never break
 * the action that triggered it, so everything is wrapped in try/catch.
 */
export async function notify(userId: string, input: NotifyInput): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      },
    });
  } catch {
    // swallow — notifications are non-critical
  }
}

/** Count a user's unread notifications. Returns 0 on any error. */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  } catch {
    return 0;
  }
}

export type RecentNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

/** Recent notifications + unread count for the dropdown bell. Safe on error. */
export async function getRecentNotifications(
  userId: string,
  limit = 8
): Promise<{ items: RecentNotification[]; unreadCount: number }> {
  try {
    const [rows, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
    return {
      items: rows.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    };
  } catch {
    return { items: [], unreadCount: 0 };
  }
}

/** Create the same notification for many recipients (e.g. announcements). */
export async function notifyMany(
  userIds: string[],
  input: NotifyInput
): Promise<void> {
  if (userIds.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      })),
    });
  } catch {
    // swallow
  }
}
