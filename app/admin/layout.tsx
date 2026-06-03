import { requireAdmin } from "@/lib/access";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppMobileNav } from "@/components/shared/AppMobileNav";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { getRecentNotifications } from "@/lib/notify";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
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
        <div className="pointer-events-none sticky top-0 z-30 hidden justify-end px-10 pt-4 lg:flex">
          <NotificationBell
            items={items}
            unreadCount={unreadCount}
            className="pointer-events-auto relative"
          />
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-8 lg:px-10 lg:pb-10 lg:pt-2">
          {children}
        </div>
      </main>
    </div>
  );
}
