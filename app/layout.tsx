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

export const metadata: Metadata = {
  title: "Koumian Academy — Learn. Grow. Elevate.",
  description:
    "A premium course library for business, marketing, and finance. Learn from carefully crafted programs designed to elevate your craft.",
  metadataBase: new URL("http://localhost:3000"),
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
