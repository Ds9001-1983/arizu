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

/* ------------------------------------------------------------- Preissaetze

   Die Euro-Saetze stehen nicht mehr als Modulkonstanten in der calc-Funktion,
   sondern in `defaultRates` — damit Arian sie unter /intern/preise selbst
   aendern kann. Zugesagt im Kundengespraech vom 14.08.2026.

   Warum ein zweiter Parameter und kein Datenbankzugriff in calc(): calc laeuft
   im BROWSER (components/site/konfigurator.tsx holt die Spec selbst, weil eine
   Funktion die Server/Client-Grenze nicht passieren kann). `Rates` ist reines
   JSON und wandert deshalb sehr wohl hinueber — die Server-Komponente laedt
   die Saetze und reicht sie neben dem Slug durch.

   Der Parameter ist mit Absicht PFLICHT und hat keinen Default: Ein Default
   machte aus einer vergessenen Aufrufstelle einen stillen Produktionsfehler
   (alte Preise, keine Meldung) statt eines Compilerfehlers. Es gibt genau
   zwei Aufrufstellen.

   Die Schluessel sind FLACH mit Punkt im Namen ("fuellgrad.normal"), obwohl
   die Werte frueher verschachtelt lagen. Dadurch ist das Zusammenfuehren von
   Standard und Ueberschreibung ein Objekt-Spread statt eines rekursiven
   Merges, die Datenbankzeile ist ein einzelner String, und die Oberflaeche
   ist eine flache Liste.

   NICHT hier hinein gehoeren Rechengroessen: Turnus-Faktoren, der
   Objektart-Faktor, der Einmal-Zuschlag, die Spanne und der MwSt.-Satz. Sie
   beschreiben Aufwand oder Kalender, nicht Preise. Faustregel fuer spaetere
   Ergaenzungen: Was in Euro ausgedrueckt ist, ist editierbar. */

export type Rates = Record<string, number>;

/** Beschreibt einen Satz fuer die Oberflaeche unter /intern/preise. */
export type RateField = {
  key: string;
  label: string;
  /** Einheit hinter dem Feld, z.B. "€/m²" oder "€ pauschal". */
  unit: string;
  /** Ueberschrift, unter der der Satz einsortiert wird. */
  group: string;
  hint?: string;
  /**
   * Satz, der im oeffentlichen Rechner NICHT vorkommt und deshalb auch keinen
   * angezeigten Preis veraendert — er dient Arian als Kalkulationsgrundlage
   * fuer Angebote, die er selbst schreibt.
   *
   * Ohne diese Markierung schlaege `check:pricing` Alarm ("Satz ohne
   * Wirkung"), und die Warnung waere berechtigt: Genau so sieht auch ein
   * uebersehener Satz nach einem Umbau aus. Die Ausnahme steht deshalb hier
   * an den Daten und nicht als Sonderfall im Pruefskript.
   */
  nurKalkulation?: boolean;
};

export type ConfiguratorSpec = {
  slug: string;
  /** Ueberschrift im Konfigurator. */
  title: string;
  /** Ein Satz, der erklaert, was der Kunde bekommt. */
  intro: string;
  fields: Field[];
  /** Code-Standard. Traegt die VERIFY-Belege und ist die Basis von check:pricing. */
  defaultRates: Rates;
  /** Beschriftungen fuer die Pflegeoberflaeche, eine je Satz. */
  rateFields: RateField[];
  calc: (v: Values, r: Rates) => CalcResult;
};

/**
 * Spezifikation anlegen und dabei den Rates-Typ aus dem Objektliteral ableiten.
 *
 * Nutzen: Innerhalb der Spec-Datei ist `r["fuellgrad.normal"]` autovervoll-
 * staendigt und ein Tippfehler ein Compilerfehler. Nach aussen bleibt es der
 * schlichte `ConfiguratorSpec`, damit die Generik sich nicht ueber
 * `ConfiguratorSlug` bis in lib/services.ts durchzieht.
 *
 * Zwei Fallen: `defaultRates` muss ein Objektliteral sein (ein `interface`
 * waere Rates nicht zuweisbar), und kein `as const` — das machte die Werte
 * readonly und literal-typisiert.
 *
 * Die doppelte Umwandlung ist noetig, weil `R` enger ist als `Rates`:
 * TypeScript laesst die direkte Zuweisung deshalb nicht zu. Sicher ist sie
 * trotzdem, denn jeder Aufrufer bekommt nach aussen nur `Rates` zu sehen.
 */
export function defineConfigurator<R extends Rates>(
  spec: Omit<ConfiguratorSpec, "defaultRates" | "calc"> & {
    defaultRates: R;
    calc: (v: Values, r: R) => CalcResult;
  },
): ConfiguratorSpec {
  return spec as unknown as ConfiguratorSpec;
}

/**
 * Satz ueber einen zur Laufzeit gebildeten Schluessel holen.
 *
 * Statische Zugriffe (`r.mindestauftrag`) sind in den Spec-Dateien exakt
 * getippt. Dynamische (`fuellgrad.${auswahl}`) kann TypeScript dort nicht
 * pruefen — dafuer ist dieser Helfer da, der `Rates` erwartet und einen
 * Rueckfall verlangt.
 */
export function rate(r: Rates, key: string, fallback: number): number {
  const n = r[key];
  return Number.isFinite(n) ? n : fallback;
}

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
 *
 * `freeKm` bleibt im Code: 20 km ist eine Entfernung, kein Preis. Der km-Satz
 * dagegen liegt als "anfahrt.pro_km" in den Rates der Entruempelung — dem
 * einzigen Konfigurator, der Anfahrt berechnet.
 */
// VERIFY: Freigrenze mit Arian bestaetigen.
export const TRAVEL = { freeKm: 20 } as const;

export function travelFee(km: number, perKm: number): number {
  return Math.max(0, km - TRAVEL.freeKm) * perKm;
}
