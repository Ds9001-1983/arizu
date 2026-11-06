/* ==================================================================
   Einwilligung: Format des Cookies, gemeinsam für Browser und Server.

   Seit 06.11.2026 (Angebot AG2026037, Position 3) gibt es zwei Kategorien:
   „notwendig“ (immer an) und „marketing“ (Meta-Pixel und Conversions API).
   Vor einer Entscheidung lädt nichts von Meta, und ohne Häkchen bei
   Marketing bleibt es dabei.

   Die Auswahl liegt in einem eigenen Cookie statt im localStorage, damit der
   Server sie lesen kann: Die Kundenart-Weiche (Server Action) und die
   Anfrage-Route schicken ihre Ereignisse per Conversions API nur, wenn dieses
   Cookie eine Marketing-Einwilligung trägt. Das Cookie selbst ist unbedingt
   erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG), weil die Seite sich sonst die
   Entscheidung nicht merken könnte und bei jedem Aufruf neu fragen müsste.

   Version: Ändern sich Kategorien, Dienste oder Zwecke, wird
   EINWILLIGUNG_VERSION erhöht. Ältere Cookies gelten dann als „keine
   Entscheidung“, und der Banner fragt neu.
   ================================================================== */

export const EINWILLIGUNG_COOKIE = "arizu_einwilligung";
export const EINWILLIGUNG_VERSION = 1;

/** Zwölf Monate, danach fragt der Banner neu. */
export const EINWILLIGUNG_MAX_AGE_S = 365 * 24 * 60 * 60;

export type Einwilligung = {
  /** Version des Banners, unter der die Entscheidung fiel. */
  v: number;
  /** Meta-Pixel und Conversions API erlaubt. */
  marketing: boolean;
  /** Zeitpunkt der Entscheidung als ISO-Zeitstempel. */
  datum: string;
};

export function einwilligungWert(marketing: boolean, jetzt = new Date()): string {
  const wert: Einwilligung = {
    v: EINWILLIGUNG_VERSION,
    marketing,
    datum: jetzt.toISOString(),
  };
  return encodeURIComponent(JSON.stringify(wert));
}

/**
 * Liest den Cookie-Wert. Alles, was nicht exakt passt (fremde Version,
 * kaputtes JSON, älter als die Laufzeit), zählt als „keine Entscheidung“ —
 * im Zweifel wird gefragt, nie still eingewilligt.
 */
export function leseEinwilligung(roh: string | undefined | null): Einwilligung | null {
  if (!roh) return null;
  let daten: unknown;
  try {
    daten = JSON.parse(roh);
  } catch {
    try {
      daten = JSON.parse(decodeURIComponent(roh));
    } catch {
      return null;
    }
  }
  if (!daten || typeof daten !== "object") return null;
  const { v, marketing, datum } = daten as Record<string, unknown>;
  if (v !== EINWILLIGUNG_VERSION || typeof marketing !== "boolean" || typeof datum !== "string") {
    return null;
  }
  const zeit = Date.parse(datum);
  if (Number.isNaN(zeit) || Date.now() - zeit > EINWILLIGUNG_MAX_AGE_S * 1000) return null;
  return { v, marketing, datum };
}

export function marketingErlaubt(roh: string | undefined | null): boolean {
  return leseEinwilligung(roh)?.marketing === true;
}
