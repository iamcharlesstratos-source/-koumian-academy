"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Circle } from "lucide-react";

const HERO_BADGES = [
  { dot: true, label: "Live library" },
  { label: "Approved members only" },
  { label: "Lifetime access" },
];

const TOPIC_CHIPS = [
  "Strategy",
  "Brand",
  "Growth",
  "Capital",
  "Modeling",
  "Operations",
  "Leadership",
  "Analytics",
  "Mentorship",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36 sm:pt-44">
      <div className="mx-auto max-w-6xl">
        {/* Top badges row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex flex-wrap items-center gap-2"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-soft/30 bg-purple/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-purple-700 dark:text-purple-200">
            <Sparkles className="h-3 w-3" />
            A premium course library
          </span>
          {HERO_BADGES.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-2 rounded-full border border-theme-strong nav-bg px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted backdrop-blur-sm"
            >
              {b.dot && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              )}
              {b.label}
            </span>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tightest text-fg sm:text-6xl md:text-7xl lg:text-[88px]"
        >
          <span className="word-violet">Learn.</span>{" "}
          <span className="word-lavender">Grow.</span>{" "}
          <span className="word-violet">Elevate.</span>
          <span className="mt-3 block text-3xl font-normal text-muted sm:text-4xl md:text-5xl">
            The new home for ambitious minds.
          </span>
        </motion.h1>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link href="/courses" className="btn-primary">
            Explore the catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/#roadmap" className="btn-secondary">
            View the roadmap
          </Link>
        </motion.div>

        {/* Topic chips strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14"
        >
          <div className="mb-3 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em] text-muted">
            <span className="h-px w-8 bg-current opacity-30" />
            What you&apos;ll learn here
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPIC_CHIPS.map((chip) => (
              <span
                key={chip}
                className="surface inline-flex items-center gap-1.5 rounded-lg border border-theme px-3 py-1.5 text-xs text-fg transition-all hover:border-purple-soft/40 hover:bg-purple/5"
              >
                <Circle className="h-1.5 w-1.5 fill-purple-500 text-purple-500 dark:fill-purple-300 dark:text-purple-300" />
                {chip}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Atmospheric blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-purple/30 blur-[120px] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-96 h-64 w-64 rounded-full bg-purple-deep/30 blur-[100px] animate-pulse-glow"
        style={{ animationDelay: "1s" }}
      />
    </section>
  );
}
