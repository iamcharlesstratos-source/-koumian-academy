// Runtime-aware Prisma client.
//
// On Cloudflare Pages / Workers (edge runtime), `process.env.NEXT_RUNTIME` is
// "edge" and we use the Neon HTTP/WebSocket driver via @prisma/adapter-neon —
// the standard Prisma client can't run on edge because it relies on Node TCP.
//
// On Node.js (local dev, Vercel, Netlify), we use the regular Prisma client
// with the singleton pattern to avoid exhausting connections during HMR.

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function makePrisma(): PrismaClient {
  const isEdge = process.env.NEXT_RUNTIME === "edge";

  if (isEdge) {
    // Lazy-load the adapter modules so the Node bundle doesn't pull them in.
    // These imports work because esbuild / Next.js handle dynamic require
    // statements based on the target runtime.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require("@neondatabase/serverless");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaNeon } = require("@prisma/adapter-neon");

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);

    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });
  }

  // Node.js runtime — use the standard client.
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalThis.__prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
