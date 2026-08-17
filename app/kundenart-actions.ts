"use server";

import { redirect } from "next/navigation";
import {
  dbConfigured,
  recordKundenartAuswahl,
  type LeadKundenart,
} from "@/lib/db";

const ziele: Record<LeadKundenart, string> = {
  privat: "/privatkunden",
  geschaeft: "/geschaeftskunden",
};

/**
 * Zählt ausschließlich den bewussten Klick auf der Startseiten-Weiche.
 * Direkte Aufrufe, Suchmaschinen und Header-Navigation verfälschen die Zahl
 * dadurch nicht. Bei einem Datenbankausfall bleibt der Weg trotzdem offen.
 */
export async function waehleKundenart(
  kundenart: LeadKundenart,
  _formData: FormData,
): Promise<never> {
  // React reicht bei jeder Form-Action FormData mit; diese Weiche hat bewusst
  // keine Nutzereingaben, nur den fest gebundenen Kundenart-Wert.
  void _formData;
  const ziel = ziele[kundenart] ?? "/";

  if (dbConfigured && kundenart in ziele) {
    try {
      await recordKundenartAuswahl(kundenart);
    } catch (error) {
      console.error("[ARIZU Kundenart-Auswahl]", error);
    }
  }

  // redirect() wirft intern und muss deshalb außerhalb des try-Blocks stehen.
  redirect(ziel);
}
