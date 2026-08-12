import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Der Build meldete sonst die Lockfile im Home-Verzeichnis als Projektwurzel.
  turbopack: { root: __dirname },

  images: {
    /**
     * Bildoptimierung komplett aus — zwei Gründe, beide inhaltlich:
     *
     * 1. KI-Kennzeichnung: Der Optimizer re-encodiert und verwirft dabei die
     *    XMP-Metadaten mit `DigitalSourceType`. Genau die brauchen wir nach
     *    Art. 50 EU AI Act (siehe docs/ki-transparenz-policy.md).
     * 2. Es gibt nichts zu gewinnen: Alle Bilder liegen bereits als WebP in
     *    Zielgröße (30–160 KB) in public/images.
     *
     * Nebeneffekt: `sharp` wird in Produktion nie aufgerufen. Das entschärft
     * die von `npm audit` gemeldeten libvips-CVEs, die über sharp mit
     * Next 16.2.7 hereinkommen — ausgenutzt werden könnten sie ohnehin nur
     * beim Verarbeiten fremder Bilder, und die Seite nimmt keine Uploads an.
     */
    unoptimized: true,
  },

  // Vom Client aus nicht erreichbar, aber sauber dokumentiert: Diese Seite
  // liefert keine fremden Skripte aus, daher greifen die Standard-Header.
  poweredByHeader: false,
};

export default nextConfig;
