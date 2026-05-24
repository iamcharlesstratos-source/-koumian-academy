"use client";

import { motion } from "framer-motion";
import { BookOpenCheck, Briefcase, GraduationCap } from "lucide-react";

const PILLARS = [
  {
    icon: BookOpenCheck,
    eyebrow: "Curated curriculum",
    title: "Structured learning",
    body:
      "Every program is reviewed for substance. No fluff, no filler — only lessons that actually move you forward.",
  },
  {
    icon: Briefcase,
    eyebrow: "Real-world skills",
    title: "Built for operators",
    body:
      "Designed by people who&apos;ve shipped real work. The frameworks here come from companies, not classrooms.",
  },
  {
    icon: GraduationCap,
    eyebrow: "Lifetime mentorship",
    title: "Career-ready, always",
    body:
      "Revisit lessons forever. Grow with a community of admin-approved learners — long after you&apos;ve finished a track.",
  },
];

export function About() {
  return (
    <section id="about" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-3xl">
          <span className="mb-3 inline-block text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            About Koumian
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            Built for the people who treat their craft like a{" "}
            <span className="word-violet">long game.</span>
          </h2>
          <p className="mt-4 text-balance text-muted">
            Koumian Academy is a small, considered course library. We&apos;re
            not chasing course counts — we&apos;re building the kind of place
            ambitious people come back to.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="surface group relative flex h-full flex-col overflow-hidden rounded-2xl border border-theme p-8 transition-all hover:border-purple-soft/40"
            >
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-purple/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
                aria-hidden
              />
              <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple/10 ring-1 ring-purple-soft/30 transition-colors group-hover:bg-purple/20">
                <p.icon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">
                {p.eyebrow}
              </span>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-fg">
                {p.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {p.body.replace(/&apos;/g, "'")}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
