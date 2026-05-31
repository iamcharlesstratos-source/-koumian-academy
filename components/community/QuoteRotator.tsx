"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote as QuoteIcon } from "lucide-react";
import { QUOTES } from "@/lib/quotes";

// Rotating motivational quote — changes every 10 seconds with a fade.
export function QuoteRotator() {
  // Start at a pseudo-random index based on the day so it's not always the
  // same first quote (avoids using Math.random during render / SSR mismatch).
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Randomize starting point on mount (client only).
    setIndex(Math.floor(Math.random() * QUOTES.length));
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  const quote = QUOTES[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-soft/30 bg-gradient-to-br from-purple/[0.12] to-purple-deep/[0.08] p-6 sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple/20 blur-3xl"
      />
      <QuoteIcon className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-300" />
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <p className="text-balance text-lg font-medium leading-relaxed text-fg sm:text-xl">
            &ldquo;{quote.text}&rdquo;
          </p>
          <footer className="mt-3 text-sm text-purple-600 dark:text-purple-300">
            — {quote.author}
          </footer>
        </motion.blockquote>
      </AnimatePresence>
    </div>
  );
}
