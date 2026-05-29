// Prisma client backed by Neon's HTTP/WebSocket driver.
//
// This adapter works on every runtime we deploy to: Node.js (local dev,
// Vercel, Netlify) and the Cloudflare Workers nodejs_compat runtime — so we
// no longer need runtime detection. The HTTP transport is slightly slower
// than a direct TCP socket for big loads, but the trade-off is portability.

import { PrismaClient } from "@prisma/client";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function makePrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalThis.__prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
