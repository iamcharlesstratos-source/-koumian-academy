"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PHASES = [
  {
    no: "01",
    title: "Foundations",
    blurb:
      "Build the mental models that everything else stands on. Strategy, finance, and brand from first principles.",
    items: [
      "Frameworks for thinking about business",
      "Reading financial statements without fear",
      "Brand as a long-term asset, not a logo",
      "The economics of attention",
    ],
  },
  {
    no: "02",
    title: "Specialization",
    blurb:
      "Go deep in the domain that fits your work. Pick a track and stay in it until you have real fluency.",
    items: [
      "Choose your domain: Business, Marketing, or Finance",
      "Senior-level lessons inside your track",
      "Case studies from real operators",
      "Critique and self-review tools",
    ],
  },
  {
    no: "03",
    title: "Application",
    blurb:
      "Take what you&apos;ve learned and put it in motion. The library shifts from study to studio.",
    items: [
      "Apply lessons to your own project or company",
      "Build artifacts: pitches, models, campaigns",
      "Refine with structured exercises",
      "Stress-test your work against real constraints",
    ],
  },
  {
    no: "04",
    title: "Mastery",
    blurb:
      "Compound returns. Revisit advanced lessons, deepen judgment, and mentor newer members.",
    items: [
      "Lifetime access to every published lesson",
      "Advanced electives released over time",
      "Community of admin-approved learners",
      "Pay it forward — mentor newer students",
    ],
  },
];

export function Roadmap() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="roadmap"
      className="relative border-y border-theme nav-bg px-6 py-24 backdrop-blur-sm sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 max-w-2xl">
          <span className="mb-3 inline-block text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            The Roadmap
          </span>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            Your learning{" "}
            <span className="word-violet">path.</span>
          </h2>
          <p className="mt-4 text-muted">
            A four-phase journey through the Koumian Academy — designed to take
            you from foundation to fluent, without rushing.
          </p>
        </div>

        <ul className="space-y-3">
          {PHASES.map((phase, i) => {
            const open = openIdx === i;
            return (
              <li key={phase.no}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className={cn(
                    "surface overflow-hidden rounded-2xl border transition-colors",
                    open
                      ? "border-purple-soft/50"
                      : "border-theme hover:border-theme-strong"
                  )}
                >
                  <button
                    onClick={() => setOpenIdx(open ? null : i)}
                    className="flex w-full items-center gap-5 px-6 py-5 text-left transition-colors hover:bg-purple/[0.03]"
                  >
                    <span
                      className={cn(
                        "flex-shrink-0 font-mono text-3xl font-bold tracking-tight transition-colors sm:text-4xl",
                        open
                          ? "text-purple-600 dark:text-purple-300"
                          : "text-purple-600/40 dark:text-purple-300/40"
                      )}
                    >
                      {phase.no}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                        Phase {phase.no} —{" "}
                        <span className="font-normal text-muted">
                          {phase.title}
                        </span>
                      </h3>
                      <p className="mt-1 line-clamp-1 text-sm text-muted">
                        {phase.blurb.replace(/&apos;/g, "'")}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-all",
                        open
                          ? "border-purple bg-purple text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                          : "border-theme-strong text-muted"
                      )}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          open && "rotate-180"
                        )}
                      />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-theme px-6 pb-6 pt-5">
                          <p className="mb-5 text-balance text-muted">
                            {phase.blurb.replace(/&apos;/g, "'")}
                          </p>
                          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {phase.items.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-3 rounded-lg px-3 py-2 text-sm text-fg transition-colors hover:bg-purple/5"
                              >
                                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple/15">
                                  <Check className="h-3 w-3 text-purple-600 dark:text-purple-300" />
                                </span>
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
