import type { Metadata, Viewport } from "next";
import { Golos_Text, Roboto, Great_Vibes } from "next/font/google";
import { EVENT, SITE_URL } from "@/lib/event";
import "./globals.css";

const golos = Golos_Text({ variable: "--font-golos", subsets: ["latin"], weight: ["500", "600", "700", "800", "900"] });
const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"] });
const script = Great_Vibes({ variable: "--font-greatvibes", subsets: ["latin"], weight: "400" });

const description = `${EVENT.kind} ${EVENT.name}, du 26 au 28 février 2027 à Cotonou. ${EVENT.theme}. Billetterie officielle organisée par e-BIDDER.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "AI-BID 2027 · Masterclass IA & marchés publics — Cotonou", template: "%s · AI-BID 2027" },
  description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "AI-BID 2027",
    title: "AI-BID 2027 — L'IA au service du montage des offres",
    description,
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/brand/logo-shield.svg" },
};

export const viewport: Viewport = {
  themeColor: "#003366",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${golos.variable} ${roboto.variable} ${script.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
