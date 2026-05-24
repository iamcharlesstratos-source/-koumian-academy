"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen } from "lucide-react";
import { Logo } from "@/components/public/Logo";
import { ThemeToggle } from "@/components/public/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 flex flex-col border-b border-theme nav-bg backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <Logo size="sm" />
        <ThemeToggle compact />
      </div>
      <nav className="flex border-t border-theme">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 px-3 py-3 text-xs font-medium transition-colors",
                active
                  ? "text-purple-700 dark:text-purple-200 [box-shadow:inset_0_-2px_0_0_#7c3aed]"
                  : "text-muted hover:text-fg"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
