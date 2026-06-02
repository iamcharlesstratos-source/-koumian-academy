"use client";

import { useEffect, useState } from "react";
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
  LogOut,
  ChevronsLeft,
  ChevronsRight,
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
// MANAGE (admin tools) + COMMUNITY + quick links. Students get a Facebook-style
// portal: My Dashboard at the very top, then Community, then Courses. No admin
// (confidential) tools are ever shown to students.
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
        items: [{ href: "/courses", label: "Course catalog", icon: BookOpen }],
      },
    ];
  }

  // Student portal — My Dashboard pinned to the top.
  return [
    {
      heading: "Menu",
      items: [
        { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard, exact: true },
      ],
    },
    community,
    {
      heading: "Learn",
      items: [{ href: "/courses", label: "Courses", icon: BookOpen }],
    },
  ];
}

// Collapse/expand toggle. The collapsed state lives as a class on <html>
// (set pre-hydration by an inline script in layout.tsx), so the sidebar width
// and the main content padding are driven entirely by CSS — no layout flash on
// load and no jump when navigating between pages.
function CollapseToggle() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(
      document.documentElement.classList.contains("sidebar-collapsed")
    );
  }, []);

  const toggle = () => {
    const el = document.documentElement;
    const next = !el.classList.contains("sidebar-collapsed");
    el.classList.toggle("sidebar-collapsed", next);
    try {
      localStorage.setItem("koumian-sidebar", next ? "collapsed" : "expanded");
    } catch {
      /* localStorage may be blocked */
    }
    setCollapsed(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="collapse-toggle inline-flex h-8 w-8 items-center justify-center rounded-full border border-theme-strong nav-bg text-muted backdrop-blur-sm transition-all hover:border-purple-soft/40 hover:text-fg"
    >
      {collapsed ? (
        <ChevronsRight className="h-4 w-4" />
      ) : (
        <ChevronsLeft className="h-4 w-4" />
      )}
    </button>
  );
}

export function AppSidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const groups = buildGroups(user.role);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <aside className="app-sidebar fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r border-theme nav-bg backdrop-blur-xl lg:flex">
      <div className="sidebar-header flex items-center justify-between px-6 py-7">
        <Logo size="sm" />
        <div className="sidebar-toggles flex items-center gap-1.5">
          <ThemeToggle compact />
          <CollapseToggle />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.heading} className="nav-group">
            <p className="sidebar-heading px-3 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
              {group.heading}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={item.label}
                    className={cn("nav-item", isActive(item) && "nav-item-active")}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="sidebar-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer border-t border-theme p-3">
        <div className="sidebar-user-row flex items-center gap-3 rounded-lg px-3 py-2.5">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              referrerPolicy="no-referrer"
              className="h-9 w-9 flex-shrink-0 rounded-full"
            />
          ) : (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple/15 text-sm text-purple-700 dark:text-purple-200">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
          <div className="sidebar-usermeta min-w-0 flex-1">
            <div className="truncate text-sm text-fg">{user.name}</div>
            <div className="truncate text-xs text-muted">{user.email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out"
          className="nav-item mt-1 w-full text-left"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span className="sidebar-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
