import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppMobileNav } from "@/components/shared/AppMobileNav";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { getRecentNotifications } from "@/lib/notify";

// The student dashboard lives inside the same sidebar shell as the community
// portal. Login is required; pending/rejected users are allowed here so they
// can see their account status (the dashboard renders the right notice).
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

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
        {children}
      </main>
    </div>
  );
}
