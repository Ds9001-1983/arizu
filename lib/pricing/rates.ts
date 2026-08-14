import type { ConfiguratorSpec, Rates } from "./types";

/* ==================================================================
   Code-Standard und Arians Überschreibungen zusammenführen.

   Diese Datei ist bewusst REIN: Sie importiert nur Typen und darf deshalb im
   Client-Bundle landen. Das Laden aus der Datenbank steckt in
   lib/rates-server.ts — außerhalb von lib/pricing/ und dort nie
   re-exportiert, damit der Neon-Treiber niemals über diesen Weg in den
   Browser gerät. Das 150-KB-Budget aus AGENTS.md wäre sofort gerissen.
   ================================================================== */

export type RateOverride = {
  konfigurator: string;
  schluessel: string;
  wert: number;
};

/**
 * Ein flacher Spread — genau dafür sind die Schlüssel flach gehalten.
 *
 * Unbekannte Schlüssel werden verworfen. Sonst wirkte eine Zeile, deren Satz
 * es im Code längst nicht mehr gibt, still weiter, und niemand fände den
 * Grund. Ebenso fliegen unbrauchbare Zahlen raus: Ein NaN würde den ganzen
 * Rechner auf "NaN €" setzen.
 */
export function resolveRates(
  spec: ConfiguratorSpec,
  overrides: RateOverride[],
): Rates {
  const out: Rates = { ...spec.defaultRates };
  for (const o of overrides) {
    if (o.konfigurator !== spec.slug) continue;
    if (!(o.schluessel in spec.defaultRates)) continue;
    if (!Number.isFinite(o.wert)) continue;
    out[o.schluessel] = o.wert;
  }
  return out;
}
