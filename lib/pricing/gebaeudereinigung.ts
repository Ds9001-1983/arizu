import { type ConfiguratorSpec, type Values, many, num, pick } from "./types";

/* ==================================================================
   Gebäudereinigung — Fläche × Reinigungsart × Turnus.

   Marktrecherche 08/2026: Unterhaltsreinigung 0,80–1,50 €/m² netto,
   Treppenhausreinigung 2,50–5,00 €/m², Stundensätze im Gewerbe 25–40 €
   netto. In Ballungsräumen 15–30 % darüber — Elmshorn liegt im Hamburger
   Speckgürtel, wir bleiben trotzdem am unteren Rand.

   Kostenuntergrenze: Seit 01.01.2026 gilt der allgemeinverbindliche
   Branchenmindestlohn von 15,00 €/h (Lohngruppe 1, Innenreinigung) bzw.
   18,40 €/h (Lohngruppe 6, Glas- und Fassadenreinigung). Glasarbeiten sind
   deshalb als eigener Zuschlag geführt und nicht im Grundpreis versteckt.
   ================================================================== */

// VERIFY: Sätze sind recherchierte Marktminima, von Arian zu bestätigen.
const ART: Record<string, number> = {
  unterhalt: 0.9,
  buero_praxis: 1.1,
  treppenhaus: 2.6,
  grund: 3.5,
  bauend: 4.5,
};

/** Einsätze pro Monat je Turnus (4,33 Wochen/Monat). */
const TURNUS: Record<string, { perMonth: number; label: string }> = {
  einmalig: { perMonth: 0, label: "einmalig" },
  woche2: { perMonth: 8.66, label: "2× pro Woche" },
  woche1: { perMonth: 4.33, label: "1× pro Woche" },
  zweiwoechentlich: { perMonth: 2.17, label: "alle 14 Tage" },
  monat1: { perMonth: 1, label: "1× pro Monat" },
};

const EXTRAS: Record<string, { perSqm?: number; flat?: number }> = {
  glas_fenster: { perSqm: 0.6 }, // eigener Satz wegen Lohngruppe 6
  desinfektion: { perSqm: 0.35 },
  terrasse: { flat: 90 },
};

// Pro Einsatz müssen Anfahrt und Mindesteinsatzzeit gedeckt sein.
// VERIFY: Höhe mit Arian abstimmen.
const MIN_ORDER_NET = 89;

export const gebaeudereinigung: ConfiguratorSpec = {
  slug: "gebaeudereinigung",
  title: "Reinigung berechnen",
  intro:
    "Sagen Sie uns Fläche, Art und Turnus — Sie sehen sofort, in welchem " +
    "Rahmen sich Ihre Reinigung bewegt.",

  minOrderNet: MIN_ORDER_NET,

  fields: [
    {
      kind: "number",
      id: "flaeche",
      label: "Zu reinigende Fläche",
      unit: "m²",
      min: 20,
      max: 3000,
      step: 10,
      default: 150,
    },
    {
      kind: "select",
      id: "art",
      label: "Art der Reinigung",
      default: "unterhalt",
      options: [
        { id: "unterhalt", label: "Unterhaltsreinigung", hint: "laufende Pflege" },
        { id: "buero_praxis", label: "Büro- oder Praxisreinigung" },
        { id: "treppenhaus", label: "Treppenhausreinigung" },
        { id: "grund", label: "Grundreinigung", hint: "einmalig, intensiv" },
        { id: "bauend", label: "Reinigung nach Bau oder Umzug" },
      ],
    },
    {
      kind: "select",
      id: "turnus",
      label: "Wie oft?",
      default: "woche1",
      options: [
        { id: "einmalig", label: "Einmalig" },
        { id: "woche2", label: "2× pro Woche" },
        { id: "woche1", label: "1× pro Woche" },
        { id: "zweiwoechentlich", label: "Alle 14 Tage" },
        { id: "monat1", label: "1× pro Monat" },
      ],
    },
    {
      kind: "checkboxes",
      id: "extras",
      label: "Zusätzlich gewünscht",
      default: [],
      options: [
        { id: "glas_fenster", label: "Glas- und Fensterreinigung" },
        { id: "desinfektion", label: "Desinfektionsreinigung" },
        { id: "terrasse", label: "Terrasse oder Außenflächen" },
      ],
    },
  ],

  calc(v: Values) {
    const flaeche = num(v, "flaeche", 150);
    const rate = ART[pick(v, "art", "unterhalt")] ?? ART.unterhalt;
    const turnusId = pick(v, "turnus", "woche1");
    const turnus = TURNUS[turnusId] ?? TURNUS.woche1;
    const notes: string[] = [];

    let perVisit = flaeche * rate;

    for (const id of many(v, "extras")) {
      const e = EXTRAS[id];
      if (!e) continue;
      perVisit += (e.flat ?? 0) + (e.perSqm ?? 0) * flaeche;
    }

    // Einzeleinsätze tragen Anfahrt und Rüstzeit allein — daher Aufschlag.
    // VERIFY: 20 % mit Arian abstimmen.
    if (turnus.perMonth === 0) perVisit *= 1.2;

    if (perVisit < MIN_ORDER_NET) {
      perVisit = MIN_ORDER_NET;
      notes.push("Mindestauftragswert pro Einsatz berücksichtigt.");
    }

    if (turnus.perMonth === 0) {
      notes.push("Einmalige Einsätze enthalten einen Zuschlag für Anfahrt und Rüstzeit.");
      return { net: perVisit, unit: "einmalig", notes };
    }

    notes.push(
      `Gerechnet mit ${turnus.label} — das sind rund ` +
        `${Math.round(turnus.perMonth)} Einsätze im Monat.`,
    );
    return { net: perVisit * turnus.perMonth, unit: "pro Monat", notes };
  },
};
