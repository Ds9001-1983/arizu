/* ==================================================================
   SINGLE SOURCE OF TRUTH — Geschaeftsdaten ARIZU Gebaeudedienstleistungen
   Quelle: Meeting-Transkript + Designentwurf vom 12.08.2026 (Notion
   "Arian von Starcar"). Jede Telefonnummer/Adresse im UI UND im JSON-LD
   stammt aus dieser Datei -> NAP (Name/Adresse/Telefon) kann nicht
   auseinanderlaufen.

   VERIFY-Markierungen sind offene Punkte bei Arian. Sie sind bewusst als
   sichtbare Platzhalter formuliert, damit nichts Falsches live geht.
   ================================================================== */

// Seit 14.08.2026 registriert (Hetzner) und live. Der nackte Name leitet per
// 308 auf www weiter, deshalb steht hier die www-Fassung: Sie ist die
// kanonische Adresse und speist Canonical-Tags, Sitemap, JSON-LD und die
// Bild-URL in den Mails.
export const SITE_URL = "https://www.arizu-gebaeudedienstleistungen.de";

// VERIFY: Zweitdomain noch nicht registriert. Gedacht als Merk-Domain fuers
// Fahrzeug (kurz genug, dass Leute sie aus dem Vorbeifahren behalten), soll
// spaeter per Redirect auf SITE_URL zeigen.
export const SITE_URL_SHORT = "https://arizu.de";

export const business = {
  name: "ARIZU Gebäudedienstleistungen",
  shortName: "ARIZU",
  // VERIFY: Rechtsform + vollstaendiger Firmenname fuers Impressum bestaetigen
  // (Einzelunternehmen, Gruendung 08/2026 aus der Arbeitslosigkeit heraus).
  legalName: "Arian Aslani — ARIZU Gebäudedienstleistungen",
  owner: "Arian Aslani",

  slogan: "Alles aus einer Hand.",
  intro:
    "Wir bieten Ihnen professionelle Dienstleistungen rund um Ihre Immobilie " +
    "und Außenanlagen. Qualität, auf die Sie sich verlassen können.",

  // Seit dem Website-Review vom 17.08.2026 ist das Festnetz der sichtbare
  // Primaerkanal. Die Mobilnummer bleibt ausschliesslich hinter WhatsApp:
  // So wirkt der Auftritt wie der Betrieb mit Buero, der er inzwischen ist,
  // ohne Arians private Mobilnummer an jeder Stelle zu vervielfachen.
  phone: {
    display: "04121 42 06 881",
    e164: "+4941214206881",
    href: "tel:+4941214206881",
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
    // Von Arian am 14.08.2026 nachgereicht.
    street: "Am Dornbusch 17",
    // VERIFY: Postleitzahl gegen die Strasse pruefen. Elmshorn hat drei
    // (25335, 25336, 25337); die 25337 stammt noch aus dem Designentwurf,
    // als die Strasse unbekannt war. Eine falsche PLZ im Impressum faellt
    // spaetestens bei der Google-Verifizierung per Postkarte auf.
    postalCode: "25337",
    city: "Elmshorn",
    country: "DE",
    countryName: "Deutschland",
  },

  // VERIFY: Koordinaten sind weiterhin der Ortsmittelpunkt Elmshorn, nicht
  // die Hausnummer. Fuer das LocalBusiness-JSON-LD ausreichend; vor dem
  // Google-Business-Profil praezisieren.
  geo: { latitude: 53.7544, longitude: 9.6533 },

  // VERIFY: Erreichbarkeitszeiten mit Arian klaeren (auch fuer Google-Profil).
  openingHours: [
    { days: ["Mo", "Di", "Mi", "Do", "Fr"], opens: "07:00", closes: "18:00" },
    { days: ["Sa"], opens: "09:00", closes: "14:00" },
  ],

  // Privat- und Geschaeftskunden sind seit 14.08.2026 gleichwertige Wege.
  audience: "B2C+B2B",

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
  region: "Kreis Pinneberg",
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

/** „04121 42 06 881" -> fuer aria-label lesbar machen. */
export function spokenPhone(display: string): string {
  return display.split("").join(" ").replace(/\s{2,}/g, " ");
}
