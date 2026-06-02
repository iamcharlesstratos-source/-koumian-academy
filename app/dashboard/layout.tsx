import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppMobileNav } from "@/components/shared/AppMobileNav";

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

  return (
    <div className="min-h-screen">
      <AppSidebar user={session.user} />
      <AppMobileNav role={session.user.role} />
      <main className="app-main">{children}</main>
    </div>
  );
}
