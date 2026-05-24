import { requireAdmin } from "@/lib/access";
import { Sidebar } from "@/components/admin/Sidebar";
import { MobileNav } from "@/components/admin/MobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen">
      <Sidebar user={session.user} />
      <MobileNav />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
