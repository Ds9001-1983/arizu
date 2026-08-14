import "server-only";

import { configurators, resolveRates, type ConfiguratorSlug, type Rates } from "./pricing";
import { dbConfigured, listRateOverrides } from "./db";

/* ==================================================================
   Preissätze für die Server-Komponenten laden.

   Diese Datei liegt bewusst AUSSERHALB von lib/pricing/ und wird dort nie
   re-exportiert: Sie zieht lib/db und damit @neondatabase/serverless herein.
   Käme das über lib/pricing/index.ts in eine Client-Komponente, läge der
   Datenbanktreiber im Browser-Bundle und das 150-KB-Budget wäre gerissen.
   `import "server-only"` oben lässt den Build hart scheitern, statt die
   Regel nur zu dokumentieren.
   ================================================================== */

export type AlleRates = Record<ConfiguratorSlug, Rates>;

/** Die Code-Standards, ohne jede Datenbankabfrage. */
export function standardRates(): AlleRates {
  const out = {} as AlleRates;
  for (const [slug, spec] of Object.entries(configurators)) {
    out[slug as ConfiguratorSlug] = { ...spec.defaultRates };
  }
  return out;
}

/**
 * Sätze inklusive Arians Überschreibungen.
 *
 * Fällt bei jedem Fehler auf die Code-Standards zurück — dasselbe Muster wie
 * im internen Bereich. Ein Neon-Ausfall während eines Vercel-Builds darf den
 * Build nicht kippen, und ohne DATABASE_URL muss die Seite weiterhin bauen
 * (das Versprechen aus dem README).
 */
export async function getAllRates(): Promise<AlleRates> {
  const standard = standardRates();
  if (!dbConfigured) return standard;

  try {
    const overrides = await listRateOverrides();
    const out = {} as AlleRates;
    for (const [slug, spec] of Object.entries(configurators)) {
      out[slug as ConfiguratorSlug] = resolveRates(spec, overrides);
    }
    return out;
  } catch (err) {
    console.error("[ARIZU] Preise konnten nicht geladen werden:", err);
    return standard;
  }
}
