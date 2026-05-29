import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal OpenNext config for Cloudflare Workers + Static Assets.
// Caching, queues, and tag invalidation use the in-memory defaults — fine for
// a small course site. Swap in R2 / Durable Objects when traffic grows.
//
// Docs: https://opennext.js.org/cloudflare/get-started
export default defineCloudflareConfig({});
