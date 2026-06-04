import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppMobileNav } from "@/components/shared/AppMobileNav";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { getRecentNotifications } from "@/lib/notify";

// The community portal is for approved members only. Pending/rejected users
// are sent to /pending; logged-out users to /login. The sidebar adapts by role
// (admins get the all-in-one Manage + Community sidebar).
export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/community");
  // Admins can access the community regardless of approval status.
  if (session.user.role !== "admin" && session.user.status !== "approved") {
    redirect("/pending");
  }

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
        <div className="pointer-events-none sticky top-0 z-30 hidden items-center justify-between gap-4 px-6 pt-4 lg:flex">
          <GlobalSearch
            className="pointer-events-auto w-full max-w-sm"
            placeholder={
              session.user.role === "admin"
                ? "Search courses & members…"
                : "Search courses…"
            }
          />
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
