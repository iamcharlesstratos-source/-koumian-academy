import type { Metadata, Viewport } from "next";
import { Poppins, Cormorant_Garamond } from "next/font/google";
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

// Elegant serif for display headlines (the new editorial look).
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
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

const SITE_TITLE = "Koumian Academy — Education. Character. Legacy.";
const SITE_DESC =
  "The internal school of Koumizen — training every Koumian in wisdom, discipline, leadership, excellence, and legacy.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESC,
  metadataBase: new URL(siteUrl),
  applicationName: "Koumian Academy",
  appleWebApp: {
    capable: true,
    title: "Koumian",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: "Koumian Academy",
    title: SITE_TITLE,
    description: SITE_DESC,
    url: siteUrl,
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "Koumian Academy" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Koumian Academy",
    description: "Education. Character. Legacy.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#09080E",
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
    <html
      lang="en"
      className={`${poppins.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
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
