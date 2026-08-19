import { serviceSlugs } from "./services";

/* ==================================================================
   Geschäftskundenbereich — Kataloge und Textaufbereitung.

   Bewusst KEINE eigene ConfiguratorSpec und kein Eintrag in `services`:
   Der Geschäftskundenbereich ist keine fünfte Leistung, sondern eine zweite
   Zielgruppe für dieselben vier. Ein weiterer Slug würde über
   `ConfiguratorSlug` (lib/pricing/index.ts) und `Service.slug`
   (lib/services.ts) Navigation, Kachelraster, Konfigurator-Tabs, Sitemap,
   generateStaticParams und das zod-Enum der Lead-API nach sich ziehen —
   und über `Service.image.assetId` auch ein neues KI-Bild samt
   story-spec-Eintrag, Badge und EXIF-Metadaten. Diese Datei umgeht das.

   Hier gibt es KEINE Preise. Grundsatz aus dem Kundengespräch vom
   14.08.2026: im Geschäftskundenbereich zunächst kein Richtwert, sondern
   eine Bedarfsabfrage. Die Sätze für die Kalkulation liegen weiterhin in
   lib/pricing/ — Arian rechnet nach der Begehung damit.
   ================================================================== */

export type B2bOption = { id: string; label: string; hint?: string };

/**
 * Hauptbereich der Anfrage. Die vier ersten IDs sind absichtlich mit den
 * Leistungs-Slugs identisch: So kann `service` direkt gesetzt werden und die
 * Bereichsstatistik im internen Bereich zählt B2B-Anfragen mit. "mehreres"
 * liefert bewusst kein `service` — lieber keine Zuordnung als eine falsche.
 */
export const B2B_LEISTUNGEN: B2bOption[] = [
  { id: "gebaeudereinigung", label: "Gebäudereinigung" },
  { id: "gartenpflege", label: "Grün- und Außenanlagenpflege" },
  { id: "entruempelung", label: "Entrümpelung und Auflösung" },
  { id: "objektbetreuung", label: "Objektbetreuung" },
  { id: "mehreres", label: "Mehreres oder noch offen" },
];

/** Zusätzliche Bereiche. Winterdienst gibt es nur hier — er ist im
    Privatbereich ein Modul der Objektbetreuung, kein eigener Rechner. */
export const B2B_WEITERE: B2bOption[] = [
  { id: "gebaeudereinigung", label: "Gebäudereinigung" },
  { id: "gartenpflege", label: "Grün- und Außenanlagenpflege" },
  { id: "entruempelung", label: "Entrümpelung und Auflösung" },
  { id: "objektbetreuung", label: "Objektbetreuung" },
  { id: "winterdienst", label: "Winterdienst" },
];

export const B2B_OBJEKTARTEN: B2bOption[] = [
  { id: "buero", label: "Bürogebäude" },
  { id: "praxis", label: "Praxis oder Gesundheitseinrichtung" },
  { id: "wohnanlage", label: "Wohnanlage oder Hausverwaltung" },
  { id: "laden", label: "Ladenlokal oder Gastronomie" },
  { id: "bildung", label: "Bildung & öffentliche Einrichtungen" },
  { id: "anderes", label: "Weitere Objekte" },
];

export const B2B_RHYTHMEN: B2bOption[] = [
  { id: "taeglich", label: "Täglich" },
  { id: "mehrmals_woche", label: "Mehrmals pro Woche" },
  { id: "woechentlich", label: "Wöchentlich" },
  { id: "zweiwoechentlich", label: "Alle 14 Tage" },
  { id: "monatlich", label: "Monatlich" },
  { id: "einmalig", label: "Einmalig oder projektbezogen" },
  { id: "offen", label: "Noch offen" },
];

/** Die Angaben aus dem Bedarfsformular, so wie sie über die API kommen. */
export type B2bAngaben = {
  hauptleistung?: string;
  weitere?: string[];
  objektart: string;
  objekte: number;
  einheiten?: number;
  flaeche?: number;
  rhythmus: string;
  start?: string;
  unternehmen: string;
  position?: string;
};

function label(katalog: B2bOption[], id: string | undefined): string | undefined {
  return katalog.find((o) => o.id === id)?.label;
}

/**
 * `service` aus der Hauptleistung ableiten.
 *
 * "mehreres" und alles Unbekannte ergeben `undefined`: Der Wert speist die
 * Bereichsstatistik, und eine geratene Zuordnung wäre dort schlimmer als eine
 * Lücke.
 */
export function serviceAusHauptleistung(id: string | undefined): string | undefined {
  return id && (serviceSlugs as readonly string[]).includes(id) ? id : undefined;
}

/**
 * Bedarf als lesbaren Text zusammenfassen.
 *
 * Wird auf dem SERVER gebaut, nicht im Client: Sonst könnte das Formular eine
 * beliebige Zeichenkette schicken, und die Beschriftungen würden mit der Zeit
 * von den Formularlabels abdriften.
 *
 * Format bewusst wie `summarize()` in lib/pricing/index.ts — "Feld: Wert · …".
 * Das ist keine Kosmetik: `whatsappText()` (lib/anfrage-text.ts) splittet an
 * " · " und macht daraus eine Aufzählung. Der Bedarfstext ist dadurch ohne
 * weitere Arbeit WhatsApp-tauglich.
 *
 * Die Firma steht bewusst an erster Stelle — sie ist das Erste, was Arian in
 * der Lead-Liste und in der Betriebsmail sieht.
 */
export function bedarfText(b: B2bAngaben): string {
  const teile: string[] = [];

  teile.push(`Firma: ${b.unternehmen}`);
  if (b.position) teile.push(`Funktion: ${b.position}`);

  const haupt = label(B2B_LEISTUNGEN, b.hauptleistung);
  if (haupt) teile.push(`Bereich: ${haupt}`);

  const weitere = (b.weitere ?? [])
    .filter((id) => id !== b.hauptleistung)
    .map((id) => label(B2B_WEITERE, id))
    .filter(Boolean);
  if (weitere.length) teile.push(`Auch: ${weitere.join(", ")}`);

  const objektart = label(B2B_OBJEKTARTEN, b.objektart);
  if (objektart) teile.push(`Objektart: ${objektart}`);

  teile.push(`Objekte: ${b.objekte}`);
  if (b.einheiten) teile.push(`Einheiten: ${b.einheiten}`);
  if (b.flaeche) teile.push(`Fläche: ${b.flaeche.toLocaleString("de-DE")} m²`);

  const rhythmus = label(B2B_RHYTHMEN, b.rhythmus);
  if (rhythmus) teile.push(`Rhythmus: ${rhythmus}`);

  // Das Datum kommt als ISO aus <input type="date"> und wäre so für Arian
  // ungewohnt zu lesen.
  if (b.start) {
    const d = new Date(`${b.start}T00:00:00`);
    teile.push(
      `Start: ${Number.isNaN(d.getTime()) ? b.start : d.toLocaleDateString("de-DE")}`,
    );
  }

  return teile.join(" · ");
}
