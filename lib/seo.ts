import type { Metadata } from "next";
import { business, serviceArea, SITE_URL } from "./business";
import type { Faq, Service } from "./services";

/* ==================================================================
   Structured Data.

   Alle Werte kommen aus lib/business.ts — dieselbe Quelle wie das sichtbare
   UI. Damit können NAP-Angaben (Name, Adresse, Telefon) in Markup und Seite
   nicht auseinanderlaufen, was Google als Inkonsistenz auslegt.

   Doppelter Zweck: klassisches SEO (Rich Results, Google-Place-Abgleich) UND
   GEO — ChatGPT, Perplexity und Gemini lesen dieses Markup, wenn sie
   entscheiden, welchen Betrieb sie empfehlen.
   ================================================================== */

const DAYS: Record<string, string> = {
  Mo: "Monday",
  Di: "Tuesday",
  Mi: "Wednesday",
  Do: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  So: "Sunday",
};

const BUSINESS_ID = `${SITE_URL}/#business`;

/* Titel der Startseite, zugleich Fallback im Root-Layout. Die beiden
   meistgesuchten Leistungen plus Ort statt des Slogans: Laut Search Console
   (18.08.–20.09.2026) kommen Impressionen fast nur über „entrümpelung
   elmshorn/pinneberg“. 51 Zeichen, unter der 60er-Grenze. */
export const HOME_TITLE =
  `Gebäudereinigung & Entrümpelung in ${business.address.city} | ${business.shortName}`;

/* Profile, die dieselbe Firma zeigen: das Google-Unternehmensprofil und —
   sobald es sie gibt — die Social-Media-Konten. Leere Einträge fallen heraus,
   weil ein `null` in sameAs ungültiges Markup wäre. */
const PROFILE_URLS = [
  business.googleBusinessUrl,
  business.social.facebook,
  business.social.instagram,
].filter((url): url is string => Boolean(url));

/**
 * Vollstaendige Seiten-Metadaten statt nur einzelner Open-Graph-Felder.
 * Next ersetzt verschachtelte Metadata-Objekte auf der konkreteren Route;
 * deshalb muessen Seitentitel, Beschreibung und globale OG-Angaben hier
 * gemeinsam ausgegeben werden.
 */
export function pageMetadata({
  title,
  description,
  path,
  robots,
}: {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: `${business.shortName} Gebäudedienstleistungen`,
      title,
      description,
      url: path,
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${business.name} — ${business.slogan}`,
        },
      ],
    },
    ...(robots ? { robots } : {}),
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    // HomeAndConstructionBusiness ist der passende Untertyp für
    // Gebäudedienstleistung — spezifischer als LocalBusiness und damit für
    // Suchsysteme aussagekräftiger.
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": BUSINESS_ID,
    name: business.name,
    legalName: business.legalName,
    founder: { "@type": "Person", name: business.owner },
    slogan: business.slogan,
    description: business.intro,
    url: SITE_URL,
    telephone: business.phone.e164,
    email: business.email,
    image: `${SITE_URL}/opengraph-image`,
    logo: `${SITE_URL}/brand/logo-arizu-print.png`,
    // Verknüpft Website und Google-Unternehmensprofil in beide Richtungen:
    // Das Profil verlinkt die Website, hier verweist die Website zurück.
    ...(business.googleBusinessUrl ? { hasMap: business.googleBusinessUrl } : {}),
    ...(PROFILE_URLS.length ? { sameAs: PROFILE_URLS } : {}),
    address: {
      "@type": "PostalAddress",
      // Seit 14.08.2026 gefuellt. Die Bedingung bleibt trotzdem stehen: Ohne
      // sie stuende bei fehlender Adresse ein leerer streetAddress im JSON-LD,
      // und ein leeres Pflichtfeld ist fuer Google schlechter als gar keins.
      ...(business.address.street ? { streetAddress: business.address.street } : {}),
      postalCode: business.address.postalCode,
      addressLocality: business.address.city,
      addressCountry: business.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    openingHoursSpecification: business.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => DAYS[d]).filter(Boolean),
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: [
      { "@type": "AdministrativeArea", name: serviceArea.region },
      ...serviceArea.cities.map((city) => ({
        "@type": "City",
        name: city,
      })),
    ],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: business.geo.latitude,
        longitude: business.geo.longitude,
      },
      geoRadius: serviceArea.radiusKm * 1000,
    },
    priceRange: "€€",
    // Zahlungshinweis mit Absicht: § 35a EStG verlangt Überweisung, Barzahlung
    // erkennt das Finanzamt nicht an. Das ist ein echtes Kundenkriterium.
    paymentAccepted: "Überweisung, Rechnung",
    currenciesAccepted: "EUR",
  };
}

/**
 * Kontaktseite als eigene Entität. `about` zeigt auf die Firma, die seit dem
 * SEO-Rollout vom 24.09.2026 auf jeder Seite im Root-Layout steht — die
 * Referenz löst also auf derselben Seite auf.
 */
export function contactPageSchema({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE_URL}${path}#contactpage`,
    url: `${SITE_URL}${path}`,
    name: title,
    description,
    inLanguage: "de-DE",
    about: { "@id": BUSINESS_ID },
  };
}

export function serviceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/leistungen/${service.slug}#service`,
    name: service.name,
    serviceType: service.name,
    description: service.seo.description,
    url: `${SITE_URL}/leistungen/${service.slug}`,
    provider: { "@id": BUSINESS_ID },
    areaServed: [
      { "@type": "AdministrativeArea", name: serviceArea.region },
      ...serviceArea.cities.map((city) => ({ "@type": "City", name: city })),
      {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: business.geo.latitude,
          longitude: business.geo.longitude,
        },
        geoRadius: serviceArea.radiusKm * 1000,
      },
    ],
    // Jede Einzelleistung als eigenes Angebot: So versteht ein Suchsystem,
    // dass "Treppenhausreinigung" hier tatsächlich angeboten wird, statt nur
    // ein Wort im Fließtext zu sehen.
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.name} — Einzeldienstleistungen`,
      itemListElement: service.items.map((item) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: item },
      })),
    },
  };
}

export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path}`,
    })),
  };
}
