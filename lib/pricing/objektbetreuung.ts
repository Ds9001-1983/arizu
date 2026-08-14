import { type Values, defineConfigurator, many, num, pick, rate } from "./types";

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

/** Gewerbe und WEG bedeuten mehr Abstimmung und Dokumentation.
    Faktoren, keine Preise — stehen deshalb NICHT in den Rates. */
const OBJEKTART: Record<string, { factor: number; label: string }> = {
  mfh: { factor: 1, label: "Mehrfamilienhaus" },
  weg: { factor: 1.05, label: "WEG mit Verwaltung" },
  gewerbe: { factor: 1.15, label: "Gewerbeobjekt" },
};

export const objektbetreuung = defineConfigurator({
  slug: "objektbetreuung",
  title: "Objektbetreuung berechnen",
  intro:
    "Sie wählen die Module, wir zeigen den monatlichen Rahmen. Ein " +
    "Betreuungsvertrag läuft monatlich kündbar.",

  /* Alle Werte netto je Wohneinheit und Monat. VERIFY: recherchierte
     Marktminima, von Arian zu bestätigen. Belege im Kopf dieser Datei.

     Zum Mindestauftragswert: Unter dieser Monatspauschale trägt sich ein
     Betreuungsvertrag nicht — Anfahrten, Dokumentation und Erreichbarkeit
     fallen unabhängig von der Objektgröße an. */
  defaultRates: {
    grundbetreuung: 16,
    "modul.treppenhaus": 6,
    "modul.aussenanlagen": 5,
    "modul.muelltonnen": 2.5,
    "modul.kleinreparaturen": 4,
    "modul.schliessdienst": 3,
    "modul.winterdienst": 7,
    mindestauftrag: 149,
  },

  rateFields: [
    {
      key: "grundbetreuung",
      label: "Grundbetreuung",
      unit: "€/Einheit/Monat",
      group: "Grundpreis",
      hint: "Sichtkontrolle und Dokumentation, immer enthalten.",
    },
    { key: "modul.treppenhaus", label: "Treppenhausreinigung", unit: "€/Einheit/Monat", group: "Zubuchbare Module" },
    { key: "modul.aussenanlagen", label: "Außenanlagen", unit: "€/Einheit/Monat", group: "Zubuchbare Module" },
    { key: "modul.muelltonnen", label: "Mülltonnenmanagement", unit: "€/Einheit/Monat", group: "Zubuchbare Module" },
    { key: "modul.kleinreparaturen", label: "Kleinreparaturen", unit: "€/Einheit/Monat", group: "Zubuchbare Module" },
    { key: "modul.schliessdienst", label: "Schließ- und Öffnungsdienste", unit: "€/Einheit/Monat", group: "Zubuchbare Module" },
    { key: "modul.winterdienst", label: "Winterdienst", unit: "€/Einheit/Monat", group: "Zubuchbare Module" },
    {
      key: "mindestauftrag",
      label: "Mindestpauschale im Monat",
      unit: "€ netto",
      group: "Sonstiges",
      hint: "Greift bei kleinen Objekten — häufigster Grund, warum eine Senkung nicht durchschlägt.",
    },
  ],

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

  calc(v: Values, r) {
    const einheiten = Math.max(1, num(v, "einheiten", 8));
    const art = OBJEKTART[pick(v, "objektart", "mfh")] ?? OBJEKTART.mfh;
    const notes: string[] = [];

    let perWE = r.grundbetreuung;
    for (const id of many(v, "module")) {
      perWE += rate(r, `modul.${id}`, 0);
    }

    let net = perWE * einheiten * art.factor;

    if (net < r.mindestauftrag) {
      net = r.mindestauftrag;
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
});
