import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "sm" ? "h-7 w-7" : size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const text =
    size === "sm"
      ? "text-base"
      : size === "lg"
      ? "text-2xl"
      : "text-lg";
  const sub =
    size === "sm"
      ? "text-[8px]"
      : size === "lg"
      ? "text-[11px]"
      : "text-[9px]";
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className={`relative ${dims}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt=""
          className="h-full w-full transition-transform group-hover:scale-105"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-semibold tracking-tight text-fg ${text}`}>
          Koumian
        </span>
        <span
          className={`mt-0.5 font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300/80 ${sub}`}
        >
          Academy
        </span>
      </span>
    </Link>
  );
}
