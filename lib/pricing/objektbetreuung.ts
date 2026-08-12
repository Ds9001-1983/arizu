import { type ConfiguratorSpec, type Values, many, num, pick } from "./types";

/* ==================================================================
   Objektbetreuung — pro Wohneinheit und Monat, modular.

   Marktrecherche 08/2026: Faustregel 15–40 € pro Wohneinheit und Monat.
   Kleine Objekte mit 5–10 Einheiten liegen bei 200–400 €/Monat, ein
   Sechsfamilienhaus je nach Umfang bei 240–700 €, größere Objekte mit
   20–40 Einheiten bei 500–900 €. Pro Quadratmeter werden 0,80–2,50 €
   monatlich genannt.

   Modell: Grundbetreuung pro Einheit plus zubuchbare Module. Das spiegelt,
   wie Verwalter tatsächlich einkaufen — und macht dem Kunden sichtbar,
   was er weglassen kann, statt ihn mit einer Pauschale zu erschlagen.
   ================================================================== */

// VERIFY: Sätze sind recherchierte Marktminima, von Arian zu bestätigen.
const GRUND_PRO_WE = 16; // €/Wohneinheit/Monat, Sichtkontrolle + Dokumentation

const MODULE: Record<string, { perWE: number; label: string }> = {
  treppenhaus: { perWE: 6, label: "Treppenhausreinigung" },
  aussenanlagen: { perWE: 5, label: "Außenanlagen" },
  muelltonnen: { perWE: 2.5, label: "Mülltonnenmanagement" },
  kleinreparaturen: { perWE: 4, label: "Kleinreparaturen" },
  schliessdienst: { perWE: 3, label: "Schließ- und Öffnungsdienste" },
  winterdienst: { perWE: 7, label: "Winterdienst" },
};

/** Gewerbe und WEG bedeuten mehr Abstimmung und Dokumentation. */
const OBJEKTART: Record<string, { factor: number; label: string }> = {
  mfh: { factor: 1, label: "Mehrfamilienhaus" },
  weg: { factor: 1.05, label: "WEG mit Verwaltung" },
  gewerbe: { factor: 1.15, label: "Gewerbeobjekt" },
};

// Unter dieser Monatspauschale trägt sich ein Betreuungsvertrag nicht:
// Anfahrten, Doku und Erreichbarkeit fallen unabhängig von der Objektgröße an.
// VERIFY: Höhe mit Arian abstimmen.
const MIN_ORDER_NET = 149;

export const objektbetreuung: ConfiguratorSpec = {
  slug: "objektbetreuung",
  title: "Objektbetreuung berechnen",
  intro:
    "Sie wählen die Module, wir zeigen den monatlichen Rahmen. Ein " +
    "Betreuungsvertrag läuft monatlich kündbar.",

  minOrderNet: MIN_ORDER_NET,

  fields: [
    {
      kind: "select",
      id: "objektart",
      label: "Art des Objekts",
      default: "mfh",
      options: [
        { id: "mfh", label: "Mehrfamilienhaus" },
        { id: "weg", label: "WEG mit Verwaltung" },
        { id: "gewerbe", label: "Gewerbeobjekt" },
      ],
    },
    {
      kind: "number",
      id: "einheiten",
      label: "Anzahl Einheiten",
      unit: "Einheiten",
      hint: "Wohnungen bzw. Gewerbeeinheiten im Objekt",
      min: 1,
      max: 80,
      step: 1,
      default: 8,
    },
    {
      kind: "checkboxes",
      id: "module",
      label: "Gewünschte Module",
      hint: "Regelmäßige Objektkontrolle und Mängelmeldung sind immer enthalten.",
      default: ["treppenhaus", "muelltonnen"],
      options: [
        { id: "treppenhaus", label: "Treppenhausreinigung" },
        { id: "aussenanlagen", label: "Außenanlagen pflegen" },
        { id: "muelltonnen", label: "Mülltonnen stellen und reinigen" },
        { id: "kleinreparaturen", label: "Kleinreparaturen und Instandhaltung" },
        { id: "schliessdienst", label: "Schließ- und Öffnungsdienste" },
        { id: "winterdienst", label: "Winterdienst", hint: "Räum- und Streupflicht" },
      ],
    },
  ],

  calc(v: Values) {
    const einheiten = Math.max(1, num(v, "einheiten", 8));
    const art = OBJEKTART[pick(v, "objektart", "mfh")] ?? OBJEKTART.mfh;
    const notes: string[] = [];

    let perWE = GRUND_PRO_WE;
    for (const id of many(v, "module")) {
      perWE += MODULE[id]?.perWE ?? 0;
    }

    let net = perWE * einheiten * art.factor;

    if (net < MIN_ORDER_NET) {
      net = MIN_ORDER_NET;
      notes.push("Mindestpauschale für die Objektbetreuung berücksichtigt.");
    }

    notes.push(
      `Entspricht rund ${Math.round(net / einheiten)} € pro Einheit und Monat.`,
    );
    if (many(v, "module").includes("winterdienst")) {
      notes.push(
        "Winterdienst rechnen wir saisonal ab — im Sommer entfällt der Anteil.",
      );
    }

    return { net, unit: "pro Monat", notes };
  },
};
