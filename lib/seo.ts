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
    address: {
      "@type": "PostalAddress",
      // VERIFY: streetAddress bleibt leer, bis Arian die Adresse liefert.
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
    areaServed: serviceArea.cities.map((city) => ({
      "@type": "City",
      name: city,
    })),
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
    areaServed: serviceArea.cities.map((city) => ({ "@type": "City", name: city })),
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
