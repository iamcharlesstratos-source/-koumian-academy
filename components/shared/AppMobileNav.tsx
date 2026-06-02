"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Megaphone,
  Trophy,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/public/Logo";
import { ThemeToggle } from "@/components/public/ThemeToggle";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean };

// App-style mobile chrome: a slim top bar (brand + theme) and a fixed bottom
// tab bar (the main destinations), like Facebook/Instagram. Admins get their
// most-used 4 tabs; students get the 5 portal tabs.
function tabsFor(role: string): Item[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Admin", icon: LayoutDashboard, exact: true },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/courses", label: "Courses", icon: BookOpen },
      { href: "/community", label: "Feed", icon: Newspaper, exact: true },
    ];
  }
  return [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
    { href: "/community", label: "Feed", icon: Newspaper, exact: true },
    { href: "/community/announcements", label: "News", icon: Megaphone },
    { href: "/community/wins", label: "Wins", icon: Trophy },
    { href: "/courses", label: "Courses", icon: BookOpen },
  ];
}

export function AppMobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const tabs = tabsFor(role);

  return (
    <>
      {/* Slim top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-theme nav-bg px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo size="sm" />
        <ThemeToggle compact />
      </header>

      {/* Fixed bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-theme nav-bg pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {tabs.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-purple-700 dark:text-purple-200"
                  : "text-muted hover:text-fg"
              )}
            >
              {active && (
                <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-purple" />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5",
                  active && "drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
