"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Megaphone,
  LineChart,
  ArrowUpRight,
} from "lucide-react";

const CATS = [
  {
    id: "business",
    label: "Business",
    blurb:
      "Strategy, leadership, and the disciplines that build durable companies.",
    icon: Briefcase,
    accent: "from-purple-700 to-purple-500",
  },
  {
    id: "marketing",
    label: "Marketing",
    blurb:
      "Brand, growth, and the craft of making something people actually want.",
    icon: Megaphone,
    accent: "from-violet-700 to-fuchsia-500",
  },
  {
    id: "finance",
    label: "Finance",
    blurb:
      "Capital, modeling, and the financial fluency every operator needs.",
    icon: LineChart,
    accent: "from-purple-600 to-indigo-500",
  },
];

export function Categories() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <span className="mb-3 inline-block text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            Three pillars
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            Three areas.{" "}
            <span className="word-violet">Endless growth.</span>
          </h2>
          <p className="mt-4 text-muted">
            Every Koumian Academy course lives in one of three domains. Pick
            yours, or explore them all.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {CATS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={`/courses?cat=${c.id}`}
                className="group surface relative flex h-full flex-col overflow-hidden rounded-2xl border border-theme p-8 transition-all hover:border-purple-soft/40"
              >
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${c.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
                  aria-hidden
                />
                <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple/10 ring-1 ring-purple-soft/30 transition-colors group-hover:bg-purple/20">
                  <c.icon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </span>

                <h3 className="text-2xl font-semibold tracking-tight text-fg">
                  {c.label}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {c.blurb}
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-theme pt-5">
                  <span className="text-xs uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
                    Explore courses
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-theme-strong text-fg transition-all group-hover:border-purple group-hover:bg-purple group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
