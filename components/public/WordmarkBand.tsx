"use client";

import { motion } from "framer-motion";

// A grand brand interlude echoing the reference: concentric violet rings +
// a huge gradient serif "Koumian" wordmark with a letter-spaced "ACADEMY".
export function WordmarkBand() {
  return (
    <section className="relative overflow-hidden px-6 py-28 sm:py-40">
      {/* Soft violet glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/20 blur-[130px]"
      />
      {/* Concentric rings (the brand mark motif) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-soft/20"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-5xl text-center"
      >
        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.35em] text-purple-600 dark:text-purple-300">
          The Academy
        </p>
        <h2
          className="font-serif font-semibold leading-[0.88]"
          style={{ fontSize: "clamp(3.4rem, 12vw, 8.5rem)" }}
        >
          <span className="bg-gradient-to-br from-[#F6F4FB] via-[#C9B6FF] to-[#7C3AED] bg-clip-text text-transparent">
            Koumian
          </span>
        </h2>
        <p
          className="mt-5 text-xs font-medium uppercase text-purple-600 dark:text-purple-300 sm:text-sm"
          style={{ letterSpacing: "0.7em", paddingLeft: "0.7em" }}
        >
          Academy
        </p>
        <p className="mx-auto mt-10 max-w-xl text-balance leading-relaxed text-muted">
          A living library for people who take their craft seriously — business,
          marketing, and finance, taught with intention.
        </p>
      </motion.div>
    </section>
  );
}
