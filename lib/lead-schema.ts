import { z } from "zod";
import { serviceSlugs } from "./services";

/* ==================================================================
   Ein Schema für Client und Server.

   Bewusst niedrige Hürde: Pflicht sind nur Name und Telefonnummer. Arian
   ruft ohnehin an — jedes zusätzliche Pflichtfeld kostet Anfragen. Die
   E-Mail ist optional, aber ohne sie kann keine Bestätigungsmail rausgehen;
   darauf weist das Formular hin.
   ================================================================== */

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an."),
  phone: z
    .string()
    .trim()
    .min(6, "Bitte geben Sie eine Telefonnummer an, unter der wir Sie erreichen."),
  email: z
    .union([z.string().trim().email("Bitte prüfen Sie die E-Mail-Adresse."), z.literal("")])
    .optional(),
  /** Objektadresse — hilft Arian, die Anfahrt einzuschätzen. */
  objekt: z.string().trim().max(200).optional(),
  message: z.string().trim().max(3000).optional(),
  service: z.enum(serviceSlugs as [string, ...string[]]).optional(),
  /** Vom Konfigurator übergebener Ergebnistext. */
  konfigurator: z.string().trim().max(2000).optional(),
  consent: z.literal(true, {
    message: "Ohne Ihre Einwilligung dürfen wir die Anfrage nicht verarbeiten.",
  }),
  /** Honeypot: für Menschen unsichtbar, Bots füllen es aus. */
  website: z.string().max(0).optional(),
});

export type Lead = z.infer<typeof leadSchema>;
