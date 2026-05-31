"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Newspaper,
  Megaphone,
  Trophy,
  Home,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/public/Logo";
import { ThemeToggle } from "@/components/public/ThemeToggle";
import { cn } from "@/lib/utils";

type AppUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
};

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };
type NavGroup = { heading: string; items: NavItem[] };

// Build the nav groups based on role. Admins get an all-in-one sidebar:
// MANAGE (admin tools) + COMMUNITY + quick links. Students get community only.
function buildGroups(role: string): NavGroup[] {
  const isAdmin = role === "admin";

  const community: NavGroup = {
    heading: "Community",
    items: [
      { href: "/community", label: "Feed", icon: Newspaper, exact: true },
      { href: "/community/announcements", label: "Announcements", icon: Megaphone },
      { href: "/community/wins", label: "Big Wins", icon: Trophy },
    ],
  };

  if (isAdmin) {
    return [
      {
        heading: "Manage",
        items: [
          { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
          { href: "/admin/users", label: "Users", icon: Users },
          { href: "/admin/courses", label: "Courses", icon: BookOpen },
        ],
      },
      community,
      {
        heading: "Quick links",
        items: [
          { href: "/courses", label: "Course catalog", icon: BookOpen },
        ],
      },
    ];
  }

  return [
    { ...community, items: [...community.items, { href: "/courses", label: "Courses", icon: BookOpen }] },
    {
      heading: "Quick links",
      items: [{ href: "/", label: "My dashboard", icon: Home, exact: true }],
    },
  ];
}

export function AppSidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const groups = buildGroups(user.role);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-theme nav-bg backdrop-blur-xl lg:flex">
      <div className="flex items-center justify-between px-6 py-7">
        <Logo size="sm" />
        <ThemeToggle compact />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.heading}>
            <p className="px-3 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
              {group.heading}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn("nav-item", isActive(item) && "nav-item-active")}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
