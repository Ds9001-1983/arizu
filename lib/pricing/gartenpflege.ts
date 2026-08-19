import { type Values, defineConfigurator, many, num, pick } from "./types";

/* ==================================================================
   Grün- und Außenanlagenpflege — Rasenfläche, Beetfläche, Heckenmeter, Turnus.

   Marktrecherche 08/2026: Rasenmähen 0,10–0,15 €/m² oder 30–40 €/h,
   Heckenschnitt 3–10 € pro laufenden Meter, Stundensätze 15–25 € für
   Hilfskräfte, 25–40 € für ausgebildete Gärtner. Regelmäßige Pflege eines
   300–500 m² Gartens liegt bei 150–300 € im Monat.

   Modellierung — hier steckt der eigentliche Denkfehler, den man leicht macht:
   Nicht jede Leistung skaliert mit der Rasenfläche, und nicht jede fällt in
   jedem Turnus an.
     * Rasenmähen  -> pro m² RASENfläche, jeden Einsatz
     * Beetpflege  -> pro m² BEETfläche (eigenes Feld!), jeden Einsatz
     * Unkraut auf Wegen und Pflaster -> Pauschale pro Einsatz, hat mit der
       Rasenfläche nichts zu tun
     * Vertikutieren, Düngen, Heckenschnitt -> ein- bis zweimal im JAHR,
       deshalb als Einmalposten getrennt ausgewiesen
   Würde man alles pro Einsatz auf die Rasenfläche rechnen, käme für einen
   400-m²-Garten das Doppelte des Marktpreises heraus.
   ================================================================== */

/** Einsätze pro Monat. Saisonvertrag = März–Oktober, auf 12 Monate verteilt.
    Kalenderarithmetik, kein Preis — steht deshalb NICHT in den Rates. */
const TURNUS: Record<string, { perMonth: number; label: string }> = {
  einmalig: { perMonth: 0, label: "einmalig" },
  zweiwoechentlich: { perMonth: 2.17, label: "alle 14 Tage" },
  monatlich: { perMonth: 1, label: "monatlich" },
  saison: { perMonth: 1.08, label: "Saisonvertrag März–Oktober" },
};

export const gartenpflege = defineConfigurator({
  slug: "gartenpflege",
  title: "Grün- und Außenanlagenpflege berechnen",
  intro:
    "Flächen, Heckenmeter, Turnus — fertig. Leistungen, die nur ein- bis " +
    "zweimal im Jahr anfallen, weisen wir getrennt aus.",

  /* Alle Werte netto. VERIFY: recherchierte Marktminima, von Arian zu
     bestätigen. Belege im Kopf dieser Datei.

     Zum Mindestauftragswert: Anfahrt und Rüstzeit (Anhänger, Geräte) müssen
     pro Einsatz gedeckt sein. */
  defaultRates: {
    "je_einsatz.rasen": 0.12,
    "je_einsatz.beet": 0.3,
    "je_einsatz.unkraut": 25,
    "je_einsatz.gruenschnitt": 15,
    "einmalig.vertikutieren": 0.25,
    "einmalig.hecke": 3.5,
    "einmalig.container": 140,
    mindestauftrag: 79,
  },

  rateFields: [
    { key: "je_einsatz.rasen", label: "Rasen mähen", unit: "€/m²", group: "Bei jedem Einsatz" },
    { key: "je_einsatz.beet", label: "Beetpflege", unit: "€/m² Beetfläche", group: "Bei jedem Einsatz" },
    { key: "je_einsatz.unkraut", label: "Unkraut auf Wegen", unit: "€ pauschal", group: "Bei jedem Einsatz" },
    {
      key: "je_einsatz.gruenschnitt",
      label: "Grünschnitt mitnehmen",
      unit: "€ pauschal",
      group: "Bei jedem Einsatz",
      hint: "Entfällt, wenn der Schnitt vor Ort bleibt.",
    },
    {
      key: "einmalig.vertikutieren",
      label: "Vertikutieren und düngen",
      unit: "€/m² Rasen",
      group: "Ein- bis zweimal im Jahr",
    },
    {
      key: "einmalig.hecke",
      label: "Heckenschnitt",
      unit: "€/lfd. Meter",
      group: "Ein- bis zweimal im Jahr",
      hint: "Pro Schnitt, bis 2 m Höhe.",
    },
    { key: "einmalig.container", label: "Container", unit: "€ pauschal", group: "Ein- bis zweimal im Jahr" },
    {
      key: "mindestauftrag",
      label: "Mindestauftragswert je Einsatz",
      unit: "€ netto",
      group: "Sonstiges",
      hint: "Greift, wenn die Rechnung darunter landet.",
    },
  ],

  fields: [
    {
      kind: "number",
      id: "rasenflaeche",
      label: "Rasenfläche",
      unit: "m²",
      min: 0,
      max: 5000,
      step: 50,
      default: 400,
    },
    {
      kind: "number",
      id: "beetflaeche",
      label: "Beet- und Pflanzfläche",
      unit: "m²",
      hint: "Nur die Beete, nicht die Rasenfläche",
      min: 0,
      max: 1000,
      step: 10,
      default: 40,
    },
    {
      kind: "checkboxes",
      id: "leistungen",
      label: "Bei jedem Einsatz",
      default: ["rasen", "beetpflege"],
      options: [
        { id: "rasen", label: "Rasen mähen" },
        { id: "beetpflege", label: "Beetpflege", hint: "jäten, auflockern, Rand stechen" },
        { id: "unkraut", label: "Unkraut auf Wegen und Pflaster" },
      ],
    },
    {
      kind: "select",
      id: "turnus",
      label: "Wie oft?",
      default: "zweiwoechentlich",
      options: [
        { id: "einmalig", label: "Einmalig" },
        { id: "zweiwoechentlich", label: "Alle 14 Tage" },
        { id: "monatlich", label: "Monatlich" },
        { id: "saison", label: "Saisonvertrag", hint: "März bis Oktober" },
      ],
    },
    {
      kind: "number",
      id: "hecke",
      label: "Heckenschnitt",
      unit: "lfd. Meter",
      hint: "Länge der Hecke, bis 2 m Höhe — fällt 1–2× im Jahr an",
      min: 0,
      max: 300,
      step: 5,
      default: 0,
    },
    {
      kind: "checkboxes",
      id: "einmalig",
      label: "Zusätzlich, ein- bis zweimal im Jahr",
      default: [],
      options: [
        { id: "vertikutieren", label: "Vertikutieren und düngen" },
        { id: "container", label: "Container für große Mengen Grünschnitt" },
      ],
    },
    {
      kind: "select",
      id: "entsorgung",
      label: "Grünschnitt bei jedem Einsatz",
      default: "mitnehmen",
      options: [
        { id: "mitnehmen", label: "Wir nehmen ihn mit" },
        { id: "vorort", label: "Bleibt vor Ort", hint: "eigener Kompost" },
      ],
    },
  ],

  calc(v: Values, r) {
    const rasen = num(v, "rasenflaeche", 400);
    const beet = num(v, "beetflaeche", 40);
    const hecke = num(v, "hecke", 0);
    const leistungen = many(v, "leistungen");
    const einmalig = many(v, "einmalig");
    const turnusId = pick(v, "turnus", "zweiwoechentlich");
    const turnus = TURNUS[turnusId] ?? TURNUS.zweiwoechentlich;
    const notes: string[] = [];

    // --- Kosten pro Einsatz ---
    let perVisit = 0;
    if (leistungen.includes("rasen")) perVisit += rasen * r["je_einsatz.rasen"];
    if (leistungen.includes("beetpflege")) perVisit += beet * r["je_einsatz.beet"];
    if (leistungen.includes("unkraut")) perVisit += r["je_einsatz.unkraut"];
    if (pick(v, "entsorgung", "mitnehmen") === "mitnehmen") {
      perVisit += r["je_einsatz.gruenschnitt"];
    }

    if (perVisit < r.mindestauftrag) {
      perVisit = r.mindestauftrag;
      notes.push("Mindestauftragswert pro Einsatz berücksichtigt.");
    }

    // --- Einmalposten, bewusst NICHT im Monatspreis ---
    let oneOff = hecke * r["einmalig.hecke"];
    if (einmalig.includes("vertikutieren")) oneOff += rasen * r["einmalig.vertikutieren"];
    if (einmalig.includes("container")) oneOff += r["einmalig.container"];

    const oneOffParts: string[] = [];
    if (hecke > 0) oneOffParts.push(`Heckenschnitt ${hecke} lfd. Meter`);
    if (einmalig.includes("vertikutieren")) oneOffParts.push("Vertikutieren und düngen");
    if (einmalig.includes("container")) oneOffParts.push("Container");

    if (hecke > 0) {
      notes.push(
        "Kräftiger Heckenrückschnitt ist nur vom 1. Oktober bis 28. Februar " +
          "erlaubt — dazwischen schützt das Bundesnaturschutzgesetz brütende Vögel.",
      );
    }

    const oneOffFields =
      oneOff > 0
        ? { oneOffNet: oneOff, oneOffLabel: oneOffParts.join(" · ") }
        : {};

    if (turnus.perMonth === 0) {
      return { net: perVisit, unit: "einmalig", notes, ...oneOffFields };
    }

    if (turnusId === "saison") {
      notes.push(
        "Saisonvertrag: Einsätze von März bis Oktober, Kosten auf 12 Monate " +
          "verteilt — Ihre monatliche Belastung bleibt gleich.",
      );
    } else {
      notes.push(`Gerechnet mit Pflege ${turnus.label}.`);
    }

    return {
      net: perVisit * turnus.perMonth,
      unit: "pro Monat",
      notes,
      ...oneOffFields,
    };
  },
});
