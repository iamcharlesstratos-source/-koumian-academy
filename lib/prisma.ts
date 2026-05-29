// Lazy Prisma client backed by Neon's HTTP/WebSocket driver.
//
// IMPORTANT: the client is only instantiated on first property access — not
// on module load. This prevents the Next.js build from crashing during
// "Collecting page data" on hosts (e.g. Cloudflare) where DATABASE_URL is a
// runtime-only secret and not exposed to the build step.

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
    throw new Error(
      "DATABASE_URL is not set. Add it to your runtime environment variables."
    );
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalThis.__prisma) {
    globalThis.__prisma = makePrisma();
  }
  return globalThis.__prisma;
}

// Proxy lets us keep the simple `prisma.user.findMany()` API while delaying
// real client creation until something is actually accessed. Bind functions
// to the real client so `this` resolves correctly for chained queries.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
