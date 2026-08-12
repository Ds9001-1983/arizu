import type { Metadata } from "next";
import { Archivo, Manrope } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { StickyCallBar } from "@/components/site/sticky-call-bar";
import { business, SITE_URL } from "@/lib/business";

/* Fontwahl bewusst gegen den KI-Standard (kein Inter/Roboto/Poppins):
   Archivo als Display — kompakt, industriell, passt zu Gebäudedienstleistung.
   Manrope fürs UI — gut lesbar auf kleinen Screens, wo die Anfragen entstehen.
   Beide variabel, also nur ein Datei-Request pro Familie. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${business.shortName} Gebäudedienstleistungen ${business.address.city} — ${business.slogan}`,
    template: `%s | ${business.shortName} ${business.address.city}`,
  },
  description:
    "Gebäudereinigung, Gartenpflege, Objektbetreuung und Entrümpelung in " +
    `${business.address.city} und Umgebung. Richtpreis in 60 Sekunden online berechnen — ` +
    "unverbindlich und kostenlos.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: `${business.shortName} Gebäudedienstleistungen`,
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${archivo.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {/* pb-14 auf Mobil: hält die fixe Anruf-Leiste vom Footer frei. */}
        <main className="flex-1 pb-14 lg:pb-0">{children}</main>
        <SiteFooter />
        <StickyCallBar />
      </body>
    </html>
  );
}
