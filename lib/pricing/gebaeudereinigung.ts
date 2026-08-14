import { type Values, defineConfigurator, many, num, pick, rate } from "./types";

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

   14.08.2026 — Kundengespräch: Die Büro- und Praxisreinigung ist aus diesem
   Rechner herausgenommen und in den Geschäftskundenbereich gewandert. Arians
   Begründung: "dass man ganze B2B-Abfragen, wie zum Beispiel Büro- oder
   Praxisreinigungen, auf einen anderen Punkt schiebt in den B2B-Bereich."
   Dort gibt es bewusst keinen Richtpreis, sondern eine Bedarfsabfrage.

   Die Treppenhausreinigung ist ABSICHTLICH geblieben: Sie ist ebenso oft der
   private Kleinvermieter mit einem Mehrfamilienhaus wie die Verwaltung, und
   sie ist der meistgesuchte Begriff dieser Seite — die FAQ "Wie oft sollte
   ein Treppenhaus gereinigt werden?" (lib/services.ts) liefe sonst ins Leere.

   Die Fensterreinigung als eigener Leistungsbereich ist auf Arians Wunsch
   vertagt: "da ist auch die Kalkulationsweise ein bisschen anders, das kann
   man nicht so vereinfachen". Der Zuschlag glas_fenster unten ist etwas
   anderes — ein Aufschlag auf einen bestehenden Reinigungsauftrag — und
   bleibt. Hier bitte KEINEN Fensterreinigungs-Rechner nachrüsten, ohne das
   vorher mit Arian zu klären.
   ================================================================== */

/** Einsätze pro Monat je Turnus (4,33 Wochen/Monat).
    Kalenderarithmetik, kein Preis — steht deshalb NICHT in den Rates. */
const TURNUS: Record<string, { perMonth: number; label: string }> = {
  einmalig: { perMonth: 0, label: "einmalig" },
  woche2: { perMonth: 8.66, label: "2× pro Woche" },
  woche1: { perMonth: 4.33, label: "1× pro Woche" },
  zweiwoechentlich: { perMonth: 2.17, label: "alle 14 Tage" },
  monat1: { perMonth: 1, label: "1× pro Monat" },
};

export const gebaeudereinigung = defineConfigurator({
  slug: "gebaeudereinigung",
  title: "Reinigung berechnen",
  intro:
    "Sagen Sie uns Fläche, Art und Turnus — Sie sehen sofort, in welchem " +
    "Rahmen sich Ihre Reinigung bewegt.",

  /* Alle Werte netto. VERIFY: recherchierte Marktminima, von Arian zu
     bestätigen. Belege im Kopf dieser Datei.

     `art.buero_praxis` wird seit dem 14.08.2026 im Privatrechner nicht mehr
     angeboten (siehe Kopfkommentar), bleibt aber als Kalkulationsgrundlage
     für Angebote aus dem Geschäftskundenbereich stehen — und damit auch als
     editierbarer Satz, denn genau dort braucht Arian ihn.

     `extra.glas_fenster` hat einen eigenen Satz wegen Lohngruppe 6
     (18,40 €/h) — er darf nicht im Grundpreis verschwinden. */
  defaultRates: {
    "art.unterhalt": 0.9,
    "art.buero_praxis": 1.1,
    "art.treppenhaus": 2.6,
    "art.grund": 3.5,
    "art.bauend": 4.5,
    "extra.glas_fenster": 0.6,
    "extra.desinfektion": 0.35,
    "extra.terrasse": 90,
    mindestauftrag: 89,
  },

  rateFields: [
    { key: "art.unterhalt", label: "Unterhaltsreinigung", unit: "€/m²", group: "Grundpreis je Einsatz" },
    {
      key: "art.buero_praxis",
      label: "Büro- oder Praxisreinigung",
      unit: "€/m²",
      group: "Grundpreis je Einsatz",
      hint: "Wird im Rechner nicht mehr angeboten — Grundlage für Ihre Angebote an Geschäftskunden.",
      nurKalkulation: true,
    },
    { key: "art.treppenhaus", label: "Treppenhausreinigung", unit: "€/m²", group: "Grundpreis je Einsatz" },
    { key: "art.grund", label: "Grundreinigung", unit: "€/m²", group: "Grundpreis je Einsatz" },
    { key: "art.bauend", label: "Nach Bau oder Umzug", unit: "€/m²", group: "Grundpreis je Einsatz" },
    {
      key: "extra.glas_fenster",
      label: "Glas- und Fensterreinigung",
      unit: "€/m²",
      group: "Zusatzleistungen",
      hint: "Glasarbeiten fallen unter Lohngruppe 6 mit 18,40 €/h Mindestlohn.",
    },
    { key: "extra.desinfektion", label: "Desinfektionsreinigung", unit: "€/m²", group: "Zusatzleistungen" },
    { key: "extra.terrasse", label: "Terrasse oder Außenflächen", unit: "€ pauschal", group: "Zusatzleistungen" },
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
      hint: "Büro- und Praxisreinigung finden Sie im Geschäftskundenbereich.",
      default: "unterhalt",
      options: [
        { id: "unterhalt", label: "Unterhaltsreinigung", hint: "laufende Pflege" },
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

  calc(v: Values, r) {
    const flaeche = num(v, "flaeche", 150);
    const satz = rate(r, `art.${pick(v, "art", "unterhalt")}`, r["art.unterhalt"]);
    const turnusId = pick(v, "turnus", "woche1");
    const turnus = TURNUS[turnusId] ?? TURNUS.woche1;
    const notes: string[] = [];

    let perVisit = flaeche * satz;

    for (const id of many(v, "extras")) {
      const wert = rate(r, `extra.${id}`, 0);
      // Terrasse ist eine Pauschale, die beiden anderen rechnen je m².
      perVisit += id === "terrasse" ? wert : wert * flaeche;
    }

    // Einzeleinsätze tragen Anfahrt und Rüstzeit allein — daher Aufschlag.
    // Prozentaufschlag, kein Preisschild: bleibt im Code.
    // VERIFY: 20 % mit Arian abstimmen.
    if (turnus.perMonth === 0) perVisit *= 1.2;

    if (perVisit < r.mindestauftrag) {
      perVisit = r.mindestauftrag;
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
});
