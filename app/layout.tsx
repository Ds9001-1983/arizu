import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { StickyCallBar } from "@/components/site/sticky-call-bar";
import { business, serviceArea, SITE_URL } from "@/lib/business";
import { archivo, manrope } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${business.shortName} Gebäudedienstleistungen ${business.address.city} — ${business.slogan}`,
    template: `%s | ${business.shortName} ${business.address.city}`,
  },
  description:
    "Gebäudereinigung, Grün- und Außenanlagenpflege, Entrümpelung und Auflösung " +
    `sowie Objektbetreuung für Privat- und Geschäftskunden. Einsatzgebiet: ` +
    `${serviceArea.label} sowie weitere Orte im Umkreis von ` +
    `${serviceArea.radiusKm} km um ${serviceArea.center}.`,
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
