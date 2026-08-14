import { z } from "zod";
import { serviceSlugs } from "./services";

/* ==================================================================
   Ein Schema für Client und Server.

   Die Adresse ist in Straße, PLZ und Ort zerlegt statt als ein Freitextfeld:
   Arian braucht sie, um Anfahrt und Aufwand einzuschätzen, und der Ort
   entscheidet mit darüber, ob ein Auftrag überhaupt in Frage kommt. Als
   Fließtext wäre das nicht auswertbar und in der WhatsApp-Nachricht nicht
   sauber formulierbar.

   Pflicht sind Name, Adresse und Telefon — mehr nicht. Die E-Mail bleibt
   optional; ohne sie kann nur keine Bestätigungsmail rausgehen, darauf weist
   das Formular hin.
   ================================================================== */

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an."),
  strasse: z.string().trim().min(3, "Bitte Straße und Hausnummer angeben."),
  plz: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Bitte eine fünfstellige Postleitzahl angeben."),
  ort: z.string().trim().min(2, "Bitte den Ort angeben."),
  phone: z
    .string()
    .trim()
    .min(6, "Bitte geben Sie eine Telefonnummer an, unter der wir Sie erreichen."),
  email: z
    .union([z.string().trim().email("Bitte prüfen Sie die E-Mail-Adresse."), z.literal("")])
    .optional(),
  message: z.string().trim().max(3000).optional(),
  service: z.enum(serviceSlugs as [string, ...string[]]).optional(),
  /** Vom Konfigurator übergebener Ergebnistext. */
  konfigurator: z.string().trim().max(2000).optional(),
  /**
   * Woher die Anfrage kam. Bei "whatsapp" hat der Kunde die Nachricht in
   * WhatsApp geöffnet — ob er sie abgeschickt hat, wissen wir nicht. Der
   * Datensatz wird trotzdem gespeichert: Name, Adresse und Nummer liegen vor,
   * Arian kann also auch dann nachfassen, wenn die Nachricht nie ankam.
   */
  source: z.enum(["formular", "whatsapp"]).optional(),
  /**
   * Privat- oder Geschäftskunde. Bewusst OPTIONAL: Ein Browser, der noch ein
   * älteres Bundle im Cache hat, schickt das Feld nicht mit — das darf keinen
   * Lead kosten. Die Route setzt dann "privat", was für die bestehenden
   * Formulare die richtige Annahme ist.
   */
  kundenart: z.enum(["privat", "geschaeft"]).optional(),
  /**
   * Die Angaben aus dem Bedarfsformular des Geschäftskundenbereichs.
   *
   * Sie bekommen KEINE eigenen Spalten: Der Neon-Treiber nimmt nur Tagged
   * Templates, jede Spalte kostet also je einen Eingriff in `create table`,
   * `alter table`, `insertLead`, `listLeads`, `getLead` und `LeadRow` — bei
   * zehn Antworten fünfzig Stellen für Daten, nach denen nie jemand filtern
   * wird. Stattdessen baut die Route daraus einen lesbaren Text und legt ihn
   * in `konfigurator` ab. Dort ist er ohne Zusatzarbeit anzeigbar, in der
   * Lead-Inbox editierbar und mailbar.
   */
  b2b: z
    .object({
      hauptleistung: z.string().trim().max(60).optional(),
      weitere: z.array(z.string().trim().max(60)).max(6).optional(),
      objektart: z.string().trim().min(1, "Bitte wählen Sie die Art des Objekts."),
      objekte: z.coerce.number().int().min(1, "Mindestens ein Objekt.").max(200),
      einheiten: z.coerce.number().int().min(0).max(5000).optional(),
      flaeche: z.coerce.number().int().min(0).max(200_000).optional(),
      rhythmus: z.string().trim().min(1, "Bitte wählen Sie einen Rhythmus."),
      start: z.string().trim().max(10).optional(),
      unternehmen: z
        .string()
        .trim()
        .min(2, "Bitte den Namen des Unternehmens angeben."),
      position: z.string().trim().max(80).optional(),
    })
    .optional(),
  consent: z.literal(true, {
    message: "Ohne Ihre Einwilligung dürfen wir die Anfrage nicht verarbeiten.",
  }),
  /** Honeypot: für Menschen unsichtbar, Bots füllen es aus. */
  website: z.string().max(0).optional(),
}).refine((d) => d.kundenart !== "geschaeft" || Boolean(d.email), {
  // Bei Privatkunden genügt der Rückruf, deshalb ist die E-Mail oben optional.
  // Ein Angebot über mehrere Objekte geht dagegen nie am Telefon raus, sondern
  // schriftlich mit Leistungsverzeichnis — ohne Adresse wäre die Anfrage für
  // Arian wertlos.
  path: ["email"],
  message: "Für das schriftliche Angebot brauchen wir eine E-Mail-Adresse.",
});

export type Lead = z.infer<typeof leadSchema>;
