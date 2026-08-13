/* ==================================================================
   SINGLE SOURCE OF TRUTH — Geschaeftsdaten ARIZU Gebaeudedienstleistungen
   Quelle: Meeting-Transkript + Designentwurf vom 12.08.2026 (Notion
   "Arian von Starcar"). Jede Telefonnummer/Adresse im UI UND im JSON-LD
   stammt aus dieser Datei -> NAP (Name/Adresse/Telefon) kann nicht
   auseinanderlaufen.

   VERIFY-Markierungen sind offene Punkte bei Arian. Sie sind bewusst als
   sichtbare Platzhalter formuliert, damit nichts Falsches live geht.
   ================================================================== */

// VERIFY: Domain ist bei DENIC noch frei (geprueft 12.08.2026) und muss
// registriert werden. Bis dahin laeuft der Prototyp auf Vercel-Preview.
export const SITE_URL = "https://www.arizu-gebaeudedienstleistungen.de";

// Zweitdomain, leitet spaeter per Redirect auf SITE_URL (Merk-Domain fuers
// Fahrzeug: kurz genug, dass Leute sie aus dem Vorbeifahren behalten).
export const SITE_URL_SHORT = "https://arizu.de";

export const business = {
  name: "ARIZU Gebäudedienstleistungen",
  shortName: "ARIZU",
  // VERIFY: Rechtsform + vollstaendiger Firmenname fuers Impressum bestaetigen
  // (Einzelunternehmen, Gruendung 08/2026 aus der Arbeitslosigkeit heraus).
  legalName: "Arian Aslani — ARIZU Gebäudedienstleistungen",
  owner: "Arian Aslani",

  slogan: "Alles aus einer Hand.",
  subclaim: "Zuverlässig. Sauber. Professionell.",
  intro:
    "Wir bieten Ihnen professionelle Dienstleistungen rund um Ihre Immobilie " +
    "und Außenanlagen. Qualität, auf die Sie sich verlassen können.",

  // Mobil ist der Primaerkanal: Arian ist tagsueber beim Kunden.
  phone: {
    display: "0179 52 72 126",
    e164: "+491795272126",
    href: "tel:+491795272126",
  },
  landline: {
    display: "04121 42 06 88",
    e164: "+494121420688",
    href: "tel:+494121420688",
  },

  // WhatsApp ist bei Gebaeudedienstleistung Primaerkanal: Kunden schicken
  // Fotos vom Objekt (Keller, Garten, Wohnung) statt es zu beschreiben.
  whatsappEnabled: true,
  whatsapp: {
    number: "491795272126",
  },

  // VERIFY: Wunsch-Adresse bestaetigen. Der Entwurf zeigt nur die Domain
  // neben dem Briefsymbol, keinen Local Part.
  email: "info@arizu-gebaeudedienstleistungen.de",

  address: {
    // VERIFY: Strasse + Hausnummer fehlen komplett — Pflichtangabe fuers
    // Impressum (§ 5 DDG) und fuer das Google-Business-Profil.
    street: "",
    postalCode: "25337",
    city: "Elmshorn",
    country: "DE",
    countryName: "Deutschland",
  },

  // VERIFY: Koordinaten sind der Ortsmittelpunkt Elmshorn, bis die genaue
  // Adresse vorliegt. Fuer LocalBusiness-JSON-LD ausreichend, fuer die
  // Kartenanzeige spaeter praezisieren.
  geo: { latitude: 53.7544, longitude: 9.6533 },

  // VERIFY: Erreichbarkeitszeiten mit Arian klaeren (auch fuer Google-Profil).
  openingHours: [
    { days: ["Mo", "Di", "Mi", "Do", "Fr"], opens: "07:00", closes: "18:00" },
    { days: ["Sa"], opens: "09:00", closes: "14:00" },
  ],

  // Startfokus B2C, B2B (Objektbetreuung fuer Staedte/Krankenhaeuser) ab 2027.
  audience: "B2C",

  social: {
    // VERIFY: Profile existieren noch nicht — Social-Setup ist auf Anfang 2027
    // terminiert. Bis dahin bleiben die Footer-Icons aus.
    facebook: null as string | null,
    instagram: null as string | null,
  },

  // VERIFY: Google-Business-Profil wird vorbereitet, Verifizierung braucht
  // Arian (Postkarte oder Telefoncode). URL nachtragen, sobald live.
  googleBusinessUrl: null as string | null,
} as const;

/** Einsatzgebiet — speist Fliesstext, areaServed im JSON-LD und die Kontaktseite. */
export const serviceArea = {
  center: "Elmshorn",
  radiusKm: 40,
  cities: [
    "Elmshorn",
    "Pinneberg",
    "Uetersen",
    "Tornesch",
    "Barmstedt",
    "Wedel",
    "Halstenbek",
    "Rellingen",
    "Quickborn",
    "Hamburg-West",
  ],
  // Kreis Pinneberg + angrenzende Bereiche, Konvention aus dem SUPERBRAND-Skill.
  plz: [
    { start: 25335, end: 25499 }, // Kreis Pinneberg
    { start: 22523, end: 22589 }, // Hamburg West/Elbvororte
  ],
} as const;

/**
 * WhatsApp-Link mit optional vorbefuellter Nachricht.
 *
 * Bewusst api.whatsapp.com statt des kuerzeren wa.me: wa.me antwortet mit
 * einem 302 und kodiert die Nachricht dabei um. Gemessen am 13.08.2026 wird
 * aus dem korrekt kodierten `%F0%9F%93%A6` (Emoji) ein `%EF%BF%BD`, also das
 * Ersatzzeichen — beim Kunden steht dann ein Fragezeichen im Chat. Betroffen
 * sind nicht nur Emojis, auch ✉ und ☎ gehen verloren.
 * api.whatsapp.com/send antwortet direkt mit 200 und laesst den Text in Ruhe.
 */
export function whatsappHref(text?: string): string {
  const base = `https://api.whatsapp.com/send?phone=${business.whatsapp.number}`;
  return text ? `${base}&text=${encodeURIComponent(text)}` : base;
}

/** „0179 52 72 126" -> fuer aria-label lesbar machen. */
export function spokenPhone(display: string): string {
  return display.split("").join(" ").replace(/\s{2,}/g, " ");
}
