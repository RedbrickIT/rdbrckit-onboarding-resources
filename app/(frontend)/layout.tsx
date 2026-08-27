import type { Metadata } from "next";
import { DM_Serif_Display, Figtree } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Heading serif — "DM Serif Display" in the Figma file (Heading/H1 Serif).
const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// Body / UI sans — "Figtree" in the Figma file. Loaded as a variable font so
// the 400 / 550 / 600 weights the design calls for are all real weights
// rather than synthesised ones.
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IT Onboarding Resources | Redbrick",
  description:
    "Email signatures, wallpapers, and account icons for new Redbrick employees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${figtree.variable}`}
    >
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
