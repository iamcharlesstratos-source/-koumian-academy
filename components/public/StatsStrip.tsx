"use client";

import { motion } from "framer-motion";

type Stat = {
  value: string;
  label: string;
};

export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <section className="border-y border-theme nav-bg backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-6 py-10 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="flex flex-col items-center text-center md:items-start md:text-left"
          >
            <span className="text-3xl font-semibold tracking-tight text-purple-700 dark:text-purple-200 md:text-4xl">
              {s.value}
            </span>
            <span className="mt-1.5 text-xs uppercase tracking-[0.2em] text-muted">
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
