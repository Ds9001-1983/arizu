import {
  type ConfiguratorSpec,
  type Values,
  many,
  num,
  pick,
  travelFee,
} from "./types";

/* ==================================================================
   Entrümpelung — der Konfigurator aus dem Kundengespräch.
   Beispiel von Dennis: 60 m², 3. Stock, 30 km Anfahrt.

   Marktrecherche 08/2026 (Bundesdurchschnitt): 15–55 €/m² netto, gestaffelt
   nach Füllgrad — wenig Inventar 15–20, normal möbliert 20–28, volle Räume
   28–38, Messie-Lage 38–55. Belegbeispiel: 90 m² normal mit gutem Zugang
   ≈ 20 €/m²; dieselbe Wohnung im 5. OG ohne Aufzug und stark vermüllt
   ≈ 50 €/m². Angesetzt wird jeweils der untere Rand.
   ================================================================== */

// VERIFY: Alle Sätze sind recherchierte Marktminima und müssen von Arian
// bestätigt werden, bevor die Seite live geht.
const FUELLGRAD: Record<string, number> = {
  wenig: 15,
  normal: 20,
  voll: 28,
  messie: 38,
};

// Zugangs-Zuschlag als €/m², weil der Aufwand mit der Menge skaliert:
// jedes Möbelstück muss die Treppe runter, nicht nur einmal der Weg.
// VERIFY: Aus dem Marktbeispiel abgeleitet (5. OG ohne Aufzug ≈ +12 €/m²),
// bewusst konservativ nach unten gesetzt.
const ZUGANG: Record<string, number> = {
  eg_aufzug: 0,
  og12: 2,
  og35: 5,
  keller_dach: 3,
};

// Unter ~290 € netto deckt ein Einsatz Anfahrt, Container und zwei
// Arbeitsstunden nicht. Seit 01.01.2026 gilt in der Branche ein
// allgemeinverbindlicher Mindestlohn von 15,00 €/h — mit Lohnnebenkosten,
// Fahrzeug und Entsorgung liegt die interne Stunde deutlich darüber.
// VERIFY: Höhe mit Arian abstimmen.
const MIN_ORDER_NET = 290;

const EXTRAS: Record<string, { flat?: number; perSqm?: number }> = {
  endreinigung: { perSqm: 3.5 }, // Grundreinigung nach dem Räumen
  sondermuell: { flat: 180 }, // Farben, Öle, Asbestverdacht separat
  moebeldemontage: { flat: 120 },
};

export const entruempelung: ConfiguratorSpec = {
  slug: "entruempelung",
  title: "Entrümpelung berechnen",
  intro:
    "Vier Angaben genügen für einen Richtpreis. Die Besichtigung vor Ort ist " +
    "kostenlos — erst danach steht der Festpreis.",

  minOrderNet: MIN_ORDER_NET,

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

  calc(v: Values) {
    const flaeche = num(v, "flaeche", 60);
    const rate = FUELLGRAD[pick(v, "fuellgrad", "normal")] ?? FUELLGRAD.normal;
    const zugang = ZUGANG[pick(v, "zugang", "eg_aufzug")] ?? 0;
    const notes: string[] = [];

    let net = flaeche * (rate + zugang);

    const anfahrt = travelFee(num(v, "anfahrt", 0));
    if (anfahrt > 0) net += anfahrt;

    for (const id of many(v, "extras")) {
      const e = EXTRAS[id];
      if (!e) continue;
      net += (e.flat ?? 0) + (e.perSqm ?? 0) * flaeche;
    }

    if (net < MIN_ORDER_NET) {
      net = MIN_ORDER_NET;
      notes.push("Mindestauftragswert für einen Einsatz berücksichtigt.");
    }

    notes.push(
      "Verwertbares Mobiliar rechnen wir an — das kann den Preis nach der " +
        "Besichtigung senken.",
    );

    return { net, unit: "einmalig", notes };
  },
};
