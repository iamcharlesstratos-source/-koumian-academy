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

// Compact bottom-tab nav for mobile. Admins get the most useful 5 tabs across
// Manage + Community; students get the community tabs.
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
    <div className="sticky top-0 z-40 flex flex-col border-b border-theme nav-bg backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Logo size="sm" />
        <ThemeToggle compact />
      </div>
      <nav className="flex border-t border-theme">
        {tabs.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-purple-700 dark:text-purple-200 [box-shadow:inset_0_-2px_0_0_#7c3aed]"
                  : "text-muted hover:text-fg"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
