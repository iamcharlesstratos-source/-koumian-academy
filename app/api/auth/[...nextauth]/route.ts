import { handlers } from "@/auth";

// API route handlers don't inherit from layouts, so the edge runtime hint
// must live in this file directly for Cloudflare Pages.
export const runtime = "edge";

export const { GET, POST } = handlers;
