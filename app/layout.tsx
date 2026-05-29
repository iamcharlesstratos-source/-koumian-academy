import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import {
  ThemeProvider,
  themeBootstrapScript,
} from "@/components/public/ThemeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// Site URL resolution order (first defined wins):
//   1. NEXT_PUBLIC_SITE_URL — set manually to your custom domain
//   2. URL                  — Netlify auto-set
//   3. VERCEL_URL           — Vercel auto-set (no protocol prefix, so we add https://)
//   4. http://localhost:3000 — local dev fallback
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
  "http://localhost:3000";

export const metadata: Metadata = {
  title: "Koumian Academy — Learn. Grow. Elevate.",
  description:
    "A premium course library for business, marketing, and finance. Learn from carefully crafted programs designed to elevate your craft.",
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
