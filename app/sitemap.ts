import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/business";
import type { ConfiguratorSlug } from "@/lib/pricing";
import { services } from "@/lib/services";

/* /intern und /agb fehlen hier absichtlich — beide Bereiche sind auf noindex
   gesetzt und gehören deshalb nicht in die Sitemap.

   lastmod ist pro Seite gepflegt, nicht aus dem Build-Zeitpunkt oder aus Git:
   Ein reines Deployment darf Suchmaschinen nicht alle Seiten als neu melden,
   und Vercel klont flach, ein Git-Datum wäre beim Bauen nicht verlässlich.
   Das Datum wird im SELBEN Commit wie die inhaltliche Änderung gesetzt.
   Reine Metadaten-, Design- oder Preisänderungen zählen nicht — Google
   ignoriert lastmod, sobald es nicht zum sichtbaren Inhalt passt. */
const LAST_CONTENT_UPDATE = {
  home: "2026-09-24",
  privatkunden: "2026-08-19",
  geschaeftskunden: "2026-08-19",
  kontakt: "2026-09-24",
  impressum: "2026-08-17",
  datenschutz: "2026-08-19",
} as const;

// Record über alle Slugs: Kommt eine Leistung dazu, fehlt ihr Datum hier als
// Compilerfehler statt still.
const SERVICE_UPDATE: Record<ConfiguratorSlug, string> = {
  gebaeudereinigung: "2026-09-24",
  gartenpflege: "2026-09-24",
  entruempelung: "2026-09-24",
  objektbetreuung: "2026-09-24",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_CONTENT_UPDATE.home,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privatkunden`,
      lastModified: LAST_CONTENT_UPDATE.privatkunden,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...services.map((s) => ({
      url: `${SITE_URL}/leistungen/${s.slug}`,
      lastModified: SERVICE_UPDATE[s.slug],
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/geschaeftskunden`,
      lastModified: LAST_CONTENT_UPDATE.geschaeftskunden,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/kontakt`,
      lastModified: LAST_CONTENT_UPDATE.kontakt,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/impressum`,
      lastModified: LAST_CONTENT_UPDATE.impressum,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/datenschutz`,
      lastModified: LAST_CONTENT_UPDATE.datenschutz,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    },
  ];
}
