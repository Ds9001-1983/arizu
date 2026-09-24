import type { Metadata } from "next";
import "./globals.css";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { StickyCallBar } from "@/components/site/sticky-call-bar";
import { business, serviceArea, SITE_URL } from "@/lib/business";
import { archivo, manrope } from "@/lib/fonts";
import { HOME_TITLE, localBusinessSchema } from "@/lib/seo";

/* Kein `alternates.canonical` und keine `openGraph.url` auf dieser Ebene:
   Beides erbt jede Route, die selbst nichts setzt — bis 23.09.2026 zeigten
   dadurch die 404-Seite und /intern/login per Canonical auf die Startseite.
   Jede indexierbare Seite setzt beides über pageMetadata() selbst.

   Der Ort steht im Titel jeder Seite, nicht im Template. Vorher hängte das
   Template „| ARIZU Elmshorn“ an, und Seitentitel mit Ort wurden doppelt. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${business.shortName}`,
  },
  description:
    "Gebäudereinigung, Gartenpflege, Entrümpelung und Objektbetreuung für " +
    `Privat- und Geschäftskunden in ${serviceArea.center}, ` +
    `${serviceArea.region} und Hamburg.`,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: `${business.shortName} Gebäudedienstleistungen`,
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
        {/* Firmen-Entität auf jeder Seite: Die Service-Schemas der
            Leistungsseiten und die Kontaktseite verweisen per @id darauf.
            Stand sie nur auf der Startseite, lief die Referenz auf allen
            Unterseiten ins Leere. */}
        <JsonLd data={localBusinessSchema()} />
        <SiteHeader />
        {/* pb-14 auf Mobil: hält die fixe Anruf-Leiste vom Footer frei. */}
        <main className="flex-1 pb-14 lg:pb-0">{children}</main>
        <SiteFooter />
        <StickyCallBar />
      </body>
    </html>
  );
}
