"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone, Newspaper, BookOpen, Trophy } from "lucide-react";
import { Logo } from "@/components/public/Logo";
import { ThemeToggle } from "@/components/public/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/community", label: "Feed", icon: Newspaper, exact: true },
  { href: "/community/announcements", label: "News", icon: Megaphone },
  { href: "/community/wins", label: "Wins", icon: Trophy },
  { href: "/courses", label: "Courses", icon: BookOpen },
];

export function StudentMobileNav() {
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
