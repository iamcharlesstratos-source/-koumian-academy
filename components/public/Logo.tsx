import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  // Uses the badged logo (philosopher on a black circular medallion). The black
  // backdrop is baked into the image so the mark stays crisp in BOTH light and
  // dark mode — the transparent version washed out against light backgrounds.
  const dims =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-20 w-20" : "h-14 w-14";
  const text =
    size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";
  const sub =
    size === "sm" ? "text-[9px]" : size === "lg" ? "text-xs" : "text-[10px]";
  return (
    <Link href="/" className="group flex items-center gap-3">
      <span
        className={`relative flex-shrink-0 overflow-hidden rounded-full shadow-lg shadow-purple/25 transition-shadow group-hover:shadow-purple/40 ${dims}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-badge.png"
          alt="Koumian Academy"
          className="h-full w-full scale-[1.01] object-cover transition-transform group-hover:scale-105"
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
