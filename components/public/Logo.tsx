import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  // Bigger logo sizes than before — the philosopher mark has detail (circuits +
  // beard) that benefits from extra display area. Using logo.png (transparent
  // background) instead of logo.jpg so the mark blends into any theme.
  const dims =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-20 w-20" : "h-14 w-14";
  const text =
    size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";
  const sub =
    size === "sm" ? "text-[9px]" : size === "lg" ? "text-xs" : "text-[10px]";
  return (
    <Link href="/" className="group flex items-center gap-3">
      <span className={`relative flex-shrink-0 ${dims}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Koumian Academy"
          className="h-full w-full object-contain transition-transform group-hover:scale-105"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-semibold tracking-tight text-fg ${text}`}>
          Koumian
        </span>
        <span
          className={`mt-1 font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300/80 ${sub}`}
        >
          Academy
        </span>
      </span>
    </Link>
  );
}
