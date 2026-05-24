"use client";

import { motion } from "framer-motion";
import { Gem, Infinity as InfinityIcon, ShieldCheck, Sparkles } from "lucide-react";

const POINTS = [
  {
    icon: Gem,
    title: "Hand-picked curriculum",
    body: "Every program is reviewed for substance. No fluff, no filler — only what advances your work.",
  },
  {
    icon: InfinityIcon,
    title: "Lifetime access",
    body: "Pay once. Revisit any lesson, anytime. The library grows with you.",
  },
  {
    icon: ShieldCheck,
    title: "Admin-approved access",
    body: "Quality stays high because every learner is reviewed and welcomed by hand.",
  },
  {
    icon: Sparkles,
    title: "Designed for ambition",
    body: "Built for the people who treat their craft like a long game — not a weekend hobby.",
  },
];

export function WhyKoumian() {
  return (
    <section
      id="about"
      className="relative border-y border-theme nav-bg px-6 py-24 backdrop-blur-sm sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <span className="mb-3 inline-block text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            Why Koumian
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            Built for serious learners.
          </h2>
          <p className="mt-4 text-muted">
            We&apos;re not chasing course counts. We&apos;re building a small,
            considered library — and the room to actually learn from it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex flex-col"
            >
              <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple/10 ring-1 ring-purple-soft/25">
                <p.icon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight text-fg">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
