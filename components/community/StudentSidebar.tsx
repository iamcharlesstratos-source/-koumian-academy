"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Megaphone,
  Newspaper,
  BookOpen,
  Trophy,
  Home,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "@/components/public/Logo";
import { ThemeToggle } from "@/components/public/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/community", label: "Feed", icon: Newspaper, exact: true },
  { href: "/community/announcements", label: "Announcements", icon: Megaphone },
  { href: "/community/wins", label: "Big Wins", icon: Trophy },
  { href: "/courses", label: "Courses", icon: BookOpen },
];

type StudentUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
};

export function StudentSidebar({ user }: { user: StudentUser }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-theme nav-bg backdrop-blur-xl lg:flex">
      <div className="flex items-center justify-between px-6 py-7">
        <Logo size="sm" />
        <ThemeToggle compact />
      </div>

      <nav className="flex-1 px-3 py-2">
        <p className="px-3 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          Community
        </p>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn("nav-item", active && "nav-item-active")}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-3 pb-2 pt-8 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          Quick links
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link href="/" className="nav-item">
              <Home className="h-4 w-4" />
              My dashboard
            </Link>
          </li>
          {user.role === "admin" && (
            <li>
              <Link href="/admin" className="nav-item">
                <LayoutDashboard className="h-4 w-4" />
                Admin dashboard
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="border-t border-theme p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple/15 text-sm text-purple-700 dark:text-purple-200">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-fg">{user.name}</div>
            <div className="truncate text-xs text-muted">{user.email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="nav-item mt-1 w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
