import Link from "next/link";
import { Logo } from "./Logo";

export function Footer({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <footer className="border-t border-theme nav-bg px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <Logo size="sm" />
          <p className="mt-3 text-xs text-muted">
            Learn. Grow. Elevate. — © {new Date().getFullYear()} Koumian Academy.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-muted">
          <Link href="/courses" className="transition-colors hover:text-fg">
            Courses
          </Link>
          {signedIn ? (
            <Link href="/profile" className="transition-colors hover:text-fg">
              Profile
            </Link>
          ) : (
            <>
              <Link href="/#about" className="transition-colors hover:text-fg">
                About
              </Link>
              <Link
                href="/#students"
                className="transition-colors hover:text-fg"
              >
                Students
              </Link>
              <Link href="/login" className="transition-colors hover:text-fg">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
