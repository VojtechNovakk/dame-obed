import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { Analytics } from '@vercel/analytics/next';
import SuggestForm from "@/components/SuggestForm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dáme Oběd – Polední menu na jednom místě",
    template: "%s | Dáme Oběd",
  },
  description:
    "Najděte nejlepší polední menu ve vaší blízkosti. Restaurace, denní menu, jídla a ceny přehledně na mapě.",
  keywords: [
    "polední menu",
    "denní menu",
    "oběd",
    "restaurace",
    "jídlo",
    "lunch menu",
    "mapa restaurací",
    "obědy Praha",
    "dáme oběd",
    "menu dnes",
  ],
  authors: [{ name: "Dáme Oběd" }],
  creator: "Dáme Oběd",
  metadataBase: new URL("https://www.dame-obed.cz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "/",
    siteName: "Dáme Oběd",
    title: "Dáme Oběd – Polední menu na jednom místě",
    description:
      "Najděte nejlepší polední menu ve vaší blízkosti. Restaurace, denní menu, jídla a ceny přehledně na mapě.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dáme Oběd – Polední menu na jednom místě",
    description:
      "Najděte nejlepší polední menu ve vaší blízkosti. Restaurace, denní menu, jídla a ceny přehledně na mapě.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Dáme Oběd",
  url: "https://www.dame-obed.cz",
  description:
    "Najděte nejlepší polední menu ve vaší blízkosti. Restaurace, denní menu, jídla a ceny přehledně na mapě.",
  applicationCategory: "FoodService",
  operatingSystem: "Web",
  inLanguage: "cs",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CZK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SessionProviderWrapper>
          {children}
          <SuggestForm />
        </SessionProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}
