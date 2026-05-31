import { requireAdmin } from "@/lib/access";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppMobileNav } from "@/components/shared/AppMobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen">
      <AppSidebar user={session.user} />
      <AppMobileNav role={session.user.role} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
