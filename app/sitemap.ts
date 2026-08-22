import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/business";
import { services } from "@/lib/services";

/* /intern und /agb fehlen hier absichtlich — beide Bereiche sind auf noindex
   gesetzt und gehören deshalb nicht in die Sitemap. Das feste Datum wird nur
   bei einer echten redaktionellen Änderung aktualisiert; ein reines Deployment
   darf Suchmaschinen nicht alle Seiten als neu melden. */
const LAST_CONTENT_UPDATE = "2026-08-20";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privatkunden`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...services.map((s) => ({
      url: `${SITE_URL}/leistungen/${s.slug}`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/geschaeftskunden`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/kontakt`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    },
    ...["impressum", "datenschutz"].map((p) => ({
      url: `${SITE_URL}/${p}`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
