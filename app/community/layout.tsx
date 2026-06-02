import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppMobileNav } from "@/components/shared/AppMobileNav";

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
  if (session.user.status !== "approved") redirect("/pending");

  return (
    <div className="min-h-screen">
      <AppSidebar user={session.user} />
      <AppMobileNav role={session.user.role} />
      <main className="app-main">
        <div className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:px-6 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
