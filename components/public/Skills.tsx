"use client";

import { motion } from "framer-motion";
import {
  Target,
  Megaphone,
  TrendingUp,
  Wallet,
  Users as UsersIcon,
  BarChart3,
} from "lucide-react";

const SKILLS = [
  {
    icon: Target,
    title: "Business Strategy",
    body: "Frameworks for durable, defensible growth — built for the long game.",
  },
  {
    icon: Megaphone,
    title: "Marketing Craft",
    body: "Brand, story, and the work of being chosen over your competitors.",
  },
  {
    icon: Wallet,
    title: "Financial Fluency",
    body: "Capital, modeling, and the numbers every operator needs to read.",
  },
  {
    icon: UsersIcon,
    title: "Leadership & Teams",
    body: "Lead teams that actually want to follow you — without theatrics.",
  },
  {
    icon: TrendingUp,
    title: "Growth Systems",
    body: "Compounding inputs over heroic outputs. Repeatable acquisition.",
  },
  {
    icon: BarChart3,
    title: "Tools & Analytics",
    body: "Read your data, ship faster, and stop guessing what's working.",
  },
];

export function Skills() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <span className="mb-3 inline-block text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            What you&apos;ll master
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            Six disciplines.{" "}
            <span className="word-violet">One library.</span>
          </h2>
          <p className="mt-4 text-muted">
            Every course in Koumian Academy sits in one of these domains —
            pieces of a complete operator&apos;s toolkit.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-theme bg-theme-strong/40 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.06, duration: 0.55 }}
              className="surface group relative p-8 transition-colors hover:bg-purple/[0.04]"
            >
              <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple/10 ring-1 ring-purple-soft/25 transition-transform group-hover:scale-110">
                <s.icon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight text-fg">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {s.body}
              </p>
              <span
                className="pointer-events-none absolute right-6 top-6 text-[10px] font-mono text-purple-600 opacity-0 transition-opacity group-hover:opacity-60 dark:text-purple-300"
                aria-hidden
              >
                0{i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
