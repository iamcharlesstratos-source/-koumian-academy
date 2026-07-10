import { requireAdmin } from "@/lib/access";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppMobileNav } from "@/components/shared/AppMobileNav";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
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
        <div className="sticky top-0 z-30 hidden items-center justify-between gap-4 border-b border-theme nav-bg px-10 py-4 backdrop-blur-xl lg:flex">
          <GlobalSearch
            className="w-full max-w-sm"
            placeholder="Search courses & members…"
          />
          <NotificationBell
            items={items}
            unreadCount={unreadCount}
            className="relative"
          />
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-8 lg:px-10 lg:pb-10 lg:pt-2">
          {children}
        </div>
      </main>
    </div>
  );
}
