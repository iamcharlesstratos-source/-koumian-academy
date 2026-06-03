import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import {
  ThemeProvider,
  themeBootstrapScript,
} from "@/components/public/ThemeProvider";
import { Toaster } from "@/components/public/Toaster";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

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
  applicationName: "Koumian Academy",
  appleWebApp: {
    capable: true,
    title: "Koumian",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0F14",
};

// Applies the saved sidebar collapsed state synchronously, before hydration,
// so there's no flash/jump of the sidebar width or content padding on load.
const sidebarBootstrapScript = `
(function(){
  try {
    if (localStorage.getItem('koumian-sidebar') === 'collapsed') {
      document.documentElement.classList.add('sidebar-collapsed');
    }
  } catch(e){}
})();
`;

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
        <script
          dangerouslySetInnerHTML={{ __html: sidebarBootstrapScript }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
