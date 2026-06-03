import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppMobileNav } from "@/components/shared/AppMobileNav";
import { getUnreadCount } from "@/lib/notify";

export default async function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/notifications");

  const unread = await getUnreadCount(session.user.id);

  return (
    <div className="min-h-screen">
      <AppSidebar user={session.user} unreadCount={unread} />
      <AppMobileNav role={session.user.role} unreadCount={unread} />
      <main className="app-main">
        <div className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:px-6 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
