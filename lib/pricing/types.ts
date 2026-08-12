/* ==================================================================
   Konfigurator-Engine — gemeinsame Typen und Rechenhilfen.

   Aufbau: Jede Leistung liefert eine Spezifikation mit (a) deklarativen
   Feldern fuer die generische UI und (b) einer getippten calc()-Funktion.
   Bewusst KEINE generische Regel-Engine: die vier Leistungen rechnen
   unterschiedlich (pro m², pro laufenden Meter, pro Wohneinheit, pro
   Monat), und eine Engine, die alles kann, waere schwerer zu pruefen als
   vier kurze, explizite Funktionen.

   Preislogik-Grundsaetze aus dem Kundengespraech:
   - Immer der MINIMALWERT der Marktspanne. Ziel ist der Erstkontakt,
     das Closing macht Arian vor Ort.
   - Ausgabe als SPANNE, nie als Fixpreis. Schuetzt vor der im Gespraech
     benannten Falle "299 angezeigt, 799 berechnet".
   - Verbraucherpreise brutto inkl. 19 % MwSt. (PAngV). Arian hat sich
     gegen die Kleinunternehmerregelung entschieden.
   ================================================================== */

export const VAT_RATE = 0.19;

export type FieldOption = {
  id: string;
  label: string;
  /** Kurzer Zusatz unter dem Label, z.B. "ab 2. Etage ohne Aufzug". */
  hint?: string;
};

export type Field =
  | {
      kind: "select";
      id: string;
      label: string;
      hint?: string;
      options: FieldOption[];
      default: string;
    }
  | {
      kind: "number";
      id: string;
      label: string;
      /** Einheit hinter dem Eingabefeld, z.B. "m²" oder "lfd. Meter". */
      unit: string;
      hint?: string;
      min: number;
      max: number;
      step: number;
      default: number;
    }
  | {
      kind: "checkboxes";
      id: string;
      label: string;
      hint?: string;
      options: FieldOption[];
      default: string[];
    };

export type Values = Record<string, string | number | string[]>;

/** Abrechnungseinheit — entscheidet, wie der Preis beschriftet wird. */
export type PriceUnit = "einmalig" | "pro Einsatz" | "pro Monat";

export type CalcResult = {
  /** Netto-Zwischensumme in Euro, vor MwSt. und vor Spannenbildung. */
  net: number;
  unit: PriceUnit;
  /** Hinweise, die im Ergebnis mitlaufen (z.B. Mindestauftragswert griff). */
  notes: string[];
  /**
   * Netto-Betrag für Leistungen, die NICHT im Turnus anfallen — Heckenschnitt
   * ein- bis zweimal im Jahr, Container einmal beim Start. Getrennt geführt,
   * weil es unseriös wäre, sie in den Monatspreis einzurechnen: der Kunde
   * würde sie zwölfmal bezahlen.
   */
  oneOffNet?: number;
  oneOffLabel?: string;
};

export type ConfiguratorSpec = {
  slug: string;
  /** Ueberschrift im Konfigurator. */
  title: string;
  /** Ein Satz, der erklaert, was der Kunde bekommt. */
  intro: string;
  fields: Field[];
  calc: (v: Values) => CalcResult;
  /** Netto-Mindestauftragswert: unter dieser Summe rechnet sich die Anfahrt nicht. */
  minOrderNet?: number;
};

/* ---------------------------------------------------------------- Helfer */

export function euro(n: number): string {
  return `${Math.round(n).toLocaleString("de-DE")} €`;
}

export function gross(net: number): number {
  return net * (1 + VAT_RATE);
}

/**
 * Unverbindliche Spanne um den berechneten Wert.
 *
 * -4 % / +18 %: Die Untergrenze liegt bewusst dicht am Rechenwert (der ist
 * schon der Marktminimalwert), nach oben ist mehr Luft, weil Zustand und
 * Zugang erst bei der Besichtigung feststehen. Auf 10 EUR gerundet, damit
 * es wie eine Schaetzung aussieht und nicht wie ein Angebot.
 */
export function estimateRange(net: number): { low: number; high: number } {
  const round10 = (x: number) => Math.round(x / 10) * 10;
  return { low: round10(net * 0.96), high: round10(net * 1.18) };
}

/** Zahlenwert aus den Formularwerten holen, mit Fallback. */
export function num(v: Values, id: string, fallback = 0): number {
  const raw = v[id];
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Auswahlwert (Radio/Select) holen. */
export function pick(v: Values, id: string, fallback = ""): string {
  const raw = v[id];
  return typeof raw === "string" ? raw : fallback;
}

/** Mehrfachauswahl holen. */
export function many(v: Values, id: string): string[] {
  const raw = v[id];
  return Array.isArray(raw) ? raw : [];
}

/**
 * Anfahrtspauschale. Die ersten Kilometer sind frei — Arians Kernrevier ist
 * Elmshorn, dort soll der Preis nicht durch Fahrtkosten unattraktiv werden.
 */
// VERIFY: Freigrenze und km-Satz mit Arian bestaetigen.
export const TRAVEL = { freeKm: 20, perKm: 0.9 } as const;

export function travelFee(km: number): number {
  return Math.max(0, km - TRAVEL.freeKm) * TRAVEL.perKm;
}
