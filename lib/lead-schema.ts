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
  consent: z.literal(true, {
    message: "Ohne Ihre Einwilligung dürfen wir die Anfrage nicht verarbeiten.",
  }),
  /** Honeypot: für Menschen unsichtbar, Bots füllen es aus. */
  website: z.string().max(0).optional(),
});

export type Lead = z.infer<typeof leadSchema>;
