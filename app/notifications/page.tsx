import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  NotificationList,
  type NotificationItem,
} from "@/components/notifications/NotificationList";

export const metadata = { title: "Notifications — Koumian Academy" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/notifications");

  let items: NotificationItem[] = [];
  try {
    const rows = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    items = rows.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));
  } catch {
    // Notification table not migrated yet — show the empty state gracefully.
    items = [];
  }

  return (
    <div>
      <header className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
          Updates
        </p>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-fg">
          <Bell className="h-6 w-6 text-purple-500 dark:text-purple-300" />
          Notifications
        </h1>
      </header>

      <NotificationList items={items} />
    </div>
  );
}
