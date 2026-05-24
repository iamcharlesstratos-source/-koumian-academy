"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

// NOTE: Placeholder testimonials. Edit names/quotes/roles here to match real
// student feedback once you have it.
const TESTIMONIALS = [
  {
    quote:
      "Koumian feels like the curriculum someone should have built ten years ago. Every lesson actually changes how I think about my business.",
    name: "Marisol Reyes",
    role: "Founder, Estudio Brand",
    initial: "M",
    accent: "from-purple-700 to-purple-500",
  },
  {
    quote:
      "I've taken probably 30 courses online. This is the first one where the lessons feel like a senior mentor pulling me aside — not a content machine.",
    name: "Daniel Cruz",
    role: "Marketing Lead, Larkfield Co.",
    initial: "D",
    accent: "from-violet-700 to-fuchsia-500",
  },
  {
    quote:
      "The finance program rewired my modeling habits in two weekends. I keep coming back to the lessons months later.",
    name: "Aria Tan",
    role: "Operator, Indie Studio",
    initial: "A",
    accent: "from-purple-600 to-indigo-500",
  },
];

export function Testimonials() {
  return (
    <section
      id="students"
      className="relative px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <span className="mb-3 inline-block text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            Students
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            What our students{" "}
            <span className="word-violet">are saying.</span>
          </h2>
          <p className="mt-4 text-muted">
            Hear it from the operators, founders, and creators who&apos;ve made
            Koumian Academy a part of their craft.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
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
                className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${t.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25`}
                aria-hidden
              />
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    strokeWidth={1}
                  />
                ))}
              </div>
              <Quote
                className="mb-4 h-6 w-6 text-purple-500 opacity-60 dark:text-purple-300"
                strokeWidth={1.5}
              />
              <blockquote className="flex-1 text-base leading-relaxed text-fg">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-theme pt-5">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.accent} text-sm font-semibold text-white shadow-lg`}
                >
                  {t.initial}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-fg">
                    {t.name}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.2em] text-muted">
          <span className="flex items-center gap-2">
            <span className="h-px w-8 bg-current opacity-30" />
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className="h-3 w-3 fill-amber-400 text-amber-400"
                  strokeWidth={1}
                />
              ))}
            </span>
            Trusted by ambitious people
            <span className="h-px w-8 bg-current opacity-30" />
          </span>
        </div>
      </div>
    </section>
  );
}
