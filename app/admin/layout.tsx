import { requireAdmin } from "@/lib/access";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppMobileNav } from "@/components/shared/AppMobileNav";
import { getUnreadCount } from "@/lib/notify";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const unread = await getUnreadCount(session.user.id);

  return (
    <div className="min-h-screen">
      <AppSidebar user={session.user} unreadCount={unread} />
      <AppMobileNav role={session.user.role} unreadCount={unread} />
      <main className="app-main">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
