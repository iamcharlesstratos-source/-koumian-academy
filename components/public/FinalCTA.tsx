"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function FinalCTA({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden px-6 py-32 sm:py-40">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.25em] text-purple-600 dark:text-purple-300">
            Ready when you are
          </span>
          <h2 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-6xl md:text-7xl">
            Your craft.{" "}
            <span className="word-violet">Elevated.</span>
          </h2>
          <p className="mt-6 text-balance text-lg leading-relaxed text-muted md:text-xl">
            Step into the catalog and find the program that takes you where
            you&apos;re trying to go.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/courses" className="btn-primary">
              Browse the catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!signedIn && (
              <Link href="/signup" className="btn-secondary">
                Create your account
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* Atmospheric blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/15 blur-[120px] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-purple-deep/25 blur-[100px] animate-pulse-glow"
        style={{ animationDelay: "1.5s" }}
      />
    </section>
  );
}
