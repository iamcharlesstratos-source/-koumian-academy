"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  Home,
  BookOpen,
  Menu,
  X,
  Info,
  Users as UsersIcon,
  Newspaper,
} from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  status: string;
};

// Tabs shown to LOGGED-IN users — real route links
const APP_TABS = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/community", label: "Community", icon: Newspaper },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

// Tabs shown to LOGGED-OUT visitors on the marketing landing — anchor links
const MARKETING_TABS = [
  { href: "/#about", label: "About", icon: Info },
  { href: "/#students", label: "Students", icon: UsersIcon },
];

export function Nav({ user }: { user: SessionUser | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const tabs = user ? APP_TABS : MARKETING_TABS;

  const isActive = (tab: { href: string; exact?: boolean }) => {
    if (tab.href.startsWith("/#")) return false; // anchor links never marked active
    return tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-theme nav-bg py-3 backdrop-blur-xl"
          : "border-b border-transparent py-6"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Logo size={scrolled ? "sm" : "md"} />
          <nav className="hidden items-center gap-1 lg:flex">
            {tabs.map((tab) => {
              const active = isActive(tab);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all",
                    active
                      ? "bg-purple/10 text-fg [box-shadow:inset_0_0_0_1px_rgba(124,58,237,0.25)]"
                      : "text-muted hover:bg-purple/5 hover:text-fg"
                  )}
                >
                  <tab.icon
                    className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      active
                        ? "text-purple-500 dark:text-purple-300"
                        : "opacity-60 group-hover:opacity-100"
                    )}
                  />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-full border border-purple-soft/30 bg-purple/10 px-3 py-1.5 text-xs text-purple-300 transition-colors hover:bg-purple/15 md:inline-flex"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          <ThemeToggle />

          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login" className="btn-primary text-sm">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-theme-strong nav-bg backdrop-blur-sm lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden">
          <div className="mx-auto max-w-7xl px-6 pb-6 pt-4">
            <div className="surface rounded-2xl border border-theme p-4 backdrop-blur-xl">
              <ul className="space-y-1">
                {tabs.map((tab) => {
                  const active = isActive(tab);
                  return (
                    <li key={tab.href}>
                      <Link
                        href={tab.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-purple/10 text-fg"
                            : "text-muted hover:bg-purple/5 hover:text-fg"
                        )}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </Link>
                    </li>
                  );
                })}
                {user?.role === "admin" && (
                  <li>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-purple-500 dark:text-purple-300"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin dashboard
                    </Link>
                  </li>
                )}
                {!user && (
                  <li>
                    <Link
                      href="/login"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-purple-500 dark:text-purple-300"
                    >
                      Sign in
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 rounded-full border border-theme-strong nav-bg px-1 py-1 pr-3 text-sm backdrop-blur-sm transition-colors hover:border-purple-soft/40"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple/20">
            <UserIcon className="h-3.5 w-3.5 text-purple-500 dark:text-purple-200" />
          </span>
        )}
        <span className="hidden text-xs text-muted md:inline">
          {user.name?.split(" ")[0] ?? "Account"}
        </span>
      </button>
      {open && (
        <div className="surface absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-theme shadow-2xl backdrop-blur-xl">
          <div className="border-b border-theme px-4 py-3">
            <div className="truncate text-sm text-fg">{user.name}</div>
            <div className="truncate text-xs text-muted">{user.email}</div>
            <div className="mt-2">
              <StatusBadge status={user.status} />
            </div>
          </div>
          <div className="p-1">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg transition-colors hover:bg-purple/5"
            >
              <UserIcon className="h-4 w-4" />
              My profile
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg transition-colors hover:bg-purple/5"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-fg transition-colors hover:bg-purple/5"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    approved: {
      label: "Approved",
      classes:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
    },
    pending: {
      label: "Pending approval",
      classes:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    },
    rejected: {
      label: "Rejected",
      classes:
        "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20",
    },
  }[status] ?? {
    label: status,
    classes: "bg-haze/10 text-muted border-theme",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        config.classes
      )}
    >
      {config.label}
    </span>
  );
}
