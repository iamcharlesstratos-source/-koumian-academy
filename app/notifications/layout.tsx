import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppMobileNav } from "@/components/shared/AppMobileNav";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { getRecentNotifications } from "@/lib/notify";

export default async function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/notifications");

  const { items, unreadCount } = await getRecentNotifications(session.user.id);

  return (
    <div className="min-h-screen">
      <AppSidebar user={session.user} />
      <AppMobileNav
        role={session.user.role}
        unreadCount={unreadCount}
        notifItems={items}
      />
      <main className="app-main">
        <div className="pointer-events-none sticky top-0 z-30 hidden justify-end px-6 pt-4 lg:flex">
          <NotificationBell
            items={items}
            unreadCount={unreadCount}
            className="pointer-events-auto relative"
          />
        </div>
        <div className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:px-6 lg:pb-12 lg:pt-2">
          {children}
        </div>
      </main>
    </div>
  );
}
