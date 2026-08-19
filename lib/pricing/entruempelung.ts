import { type Values, defineConfigurator, many, num, pick, rate, travelFee } from "./types";

/* ==================================================================
   Entrümpelung und Auflösung — der Konfigurator aus dem Kundengespräch.
   Beispiel von Dennis: 60 m², 3. Stock, 30 km Anfahrt.

   Marktrecherche 08/2026 (Bundesdurchschnitt): 15–55 €/m² netto, gestaffelt
   nach Füllgrad — wenig Inventar 15–20, normal möbliert 20–28, volle Räume
   28–38, Messie-Lage 38–55. Belegbeispiel: 90 m² normal mit gutem Zugang
   ≈ 20 €/m²; dieselbe Wohnung im 5. OG ohne Aufzug und stark vermüllt
   ≈ 50 €/m². Angesetzt wird jeweils der untere Rand.
   ================================================================== */

export const entruempelung = defineConfigurator({
  slug: "entruempelung",
  title: "Entrümpelung und Auflösung berechnen",
  intro:
    "Vier Angaben genügen für eine erste Preisschätzung. Die Besichtigung vor Ort ist " +
    "kostenlos — erst danach steht der Festpreis.",

  /* Alle Werte netto. VERIFY: recherchierte Marktminima, von Arian zu
     bestätigen, bevor die Seite live geht. Die Belege stehen im Kopf dieser
     Datei — beim Ändern eines Standards bitte mitziehen und
     `npm run check:pricing` laufen lassen (AGENTS.md).

     Zum Zugangs-Zuschlag: als €/m², weil der Aufwand mit der Menge skaliert —
     jedes Möbelstück muss die Treppe runter, nicht nur einmal der Weg. Aus
     dem Marktbeispiel abgeleitet (5. OG ohne Aufzug ≈ +12 €/m²), bewusst
     konservativ nach unten gesetzt.

     Zum Mindestauftragswert: Unter ~290 € netto deckt ein Einsatz Anfahrt,
     Container und zwei Arbeitsstunden nicht. Seit 01.01.2026 gilt ein
     allgemeinverbindlicher Mindestlohn von 15,00 €/h — mit Lohnnebenkosten,
     Fahrzeug und Entsorgung liegt die interne Stunde deutlich darüber. */
  defaultRates: {
    "fuellgrad.wenig": 15,
    "fuellgrad.normal": 20,
    "fuellgrad.voll": 28,
    "fuellgrad.messie": 38,
    "zugang.eg_aufzug": 0,
    "zugang.og12": 2,
    "zugang.og35": 5,
    "zugang.keller_dach": 3,
    "extra.endreinigung": 3.5,
    "extra.sondermuell": 180,
    "extra.moebeldemontage": 120,
    "anfahrt.pro_km": 0.9,
    mindestauftrag: 290,
  },

  rateFields: [
    { key: "fuellgrad.wenig", label: "Wenig Inventar", unit: "€/m²", group: "Grundpreis nach Füllgrad" },
    { key: "fuellgrad.normal", label: "Normal möbliert", unit: "€/m²", group: "Grundpreis nach Füllgrad" },
    { key: "fuellgrad.voll", label: "Voll", unit: "€/m²", group: "Grundpreis nach Füllgrad" },
    { key: "fuellgrad.messie", label: "Stark vermüllt", unit: "€/m²", group: "Grundpreis nach Füllgrad" },
    { key: "zugang.eg_aufzug", label: "Erdgeschoss oder Aufzug", unit: "€/m²", group: "Zuschlag nach Zugang" },
    { key: "zugang.og12", label: "1.–2. OG ohne Aufzug", unit: "€/m²", group: "Zuschlag nach Zugang" },
    { key: "zugang.og35", label: "3.–5. OG ohne Aufzug", unit: "€/m²", group: "Zuschlag nach Zugang" },
    { key: "zugang.keller_dach", label: "Keller oder Dachboden", unit: "€/m²", group: "Zuschlag nach Zugang" },
    { key: "extra.endreinigung", label: "Grundreinigung nach dem Räumen", unit: "€/m²", group: "Zusatzleistungen" },
    { key: "extra.sondermuell", label: "Sondermüll entsorgen", unit: "€ pauschal", group: "Zusatzleistungen" },
    { key: "extra.moebeldemontage", label: "Möbel demontieren", unit: "€ pauschal", group: "Zusatzleistungen" },
    {
      key: "anfahrt.pro_km",
      label: "Anfahrt",
      unit: "€/km",
      group: "Sonstiges",
      hint: "Erst ab dem 21. Kilometer, die ersten 20 bleiben frei.",
    },
    {
      key: "mindestauftrag",
      label: "Mindestauftragswert",
      unit: "€ netto",
      group: "Sonstiges",
      hint: "Greift, wenn die Rechnung darunter landet — häufigster Grund, warum eine Senkung nicht durchschlägt.",
    },
  ],

  fields: [
    {
      kind: "number",
      id: "flaeche",
      label: "Zu räumende Fläche",
      unit: "m²",
      hint: "Wohnfläche, Keller- oder Dachbodenfläche",
      min: 5,
      max: 400,
      step: 5,
      default: 60,
    },
    {
      kind: "select",
      id: "fuellgrad",
      label: "Wie voll ist es?",
      default: "normal",
      options: [
        { id: "wenig", label: "Wenig", hint: "einzelne Möbel, viel freie Fläche" },
        { id: "normal", label: "Normal möbliert", hint: "üblicher Haushalt" },
        { id: "voll", label: "Voll", hint: "Räume dicht gestellt, Kartons" },
        { id: "messie", label: "Stark vermüllt", hint: "Wege zugestellt" },
      ],
    },
    {
      kind: "select",
      id: "zugang",
      label: "Zugang",
      default: "eg_aufzug",
      options: [
        { id: "eg_aufzug", label: "Erdgeschoss oder Aufzug" },
        { id: "og12", label: "1.–2. OG ohne Aufzug" },
        { id: "og35", label: "3.–5. OG ohne Aufzug" },
        { id: "keller_dach", label: "Keller oder Dachboden", hint: "enge Treppe" },
      ],
    },
    {
      kind: "number",
      id: "anfahrt",
      label: "Entfernung von Elmshorn",
      unit: "km",
      hint: "Die ersten 20 km sind frei",
      min: 0,
      max: 90,
      step: 5,
      default: 10,
    },
    {
      kind: "checkboxes",
      id: "extras",
      label: "Zusätzlich gewünscht",
      default: [],
      options: [
        {
          id: "endreinigung",
          label: "Grundreinigung nach dem Räumen",
          hint: "übergabefertig für Vermieter",
        },
        { id: "sondermuell", label: "Sondermüll entsorgen", hint: "Farben, Öle, Chemie" },
        { id: "moebeldemontage", label: "Möbel demontieren" },
      ],
    },
  ],

  calc(v: Values, r) {
    const flaeche = num(v, "flaeche", 60);
    const satz = rate(r, `fuellgrad.${pick(v, "fuellgrad", "normal")}`, r["fuellgrad.normal"]);
    const zugang = rate(r, `zugang.${pick(v, "zugang", "eg_aufzug")}`, 0);
    const notes: string[] = [];

    let net = flaeche * (satz + zugang);

    const anfahrt = travelFee(num(v, "anfahrt", 0), r["anfahrt.pro_km"]);
    if (anfahrt > 0) net += anfahrt;

    // Flächenabhängig oder pauschal — die Unterscheidung steckt jetzt hier
    // statt in einer Datenstruktur, weil ein Satz in den Rates nur eine Zahl
    // sein kann.
    for (const id of many(v, "extras")) {
      const wert = rate(r, `extra.${id}`, 0);
      net += id === "endreinigung" ? wert * flaeche : wert;
    }

    if (net < r.mindestauftrag) {
      net = r.mindestauftrag;
      notes.push("Mindestauftragswert für einen Einsatz berücksichtigt.");
    }

    notes.push(
      "Verwertbares Mobiliar rechnen wir an — das kann den Preis nach der " +
        "Besichtigung senken.",
    );

    return { net, unit: "einmalig", notes };
  },
});
