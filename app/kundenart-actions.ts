"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
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
 *
 * Gezählt wird mit `after()`, also erst nach der Weiterleitung: Neon legt
 * die Datenbank bei Ruhe schlafen, und das Aufwachen dauert einige Sekunden.
 * Vorher wartete der Besucher so lange auf die Zielseite (im QA-Lauf vom
 * 04.11.2026 sichtbar geworden: 5 s statt 0,5 s).
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
    after(async () => {
      try {
        await recordKundenartAuswahl(kundenart);
      } catch (error) {
        console.error("[ARIZU Kundenart-Auswahl]", error);
      }
    });
  }

  // redirect() wirft intern und muss deshalb außerhalb des try-Blocks stehen.
  redirect(ziel);
}
