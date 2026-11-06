"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { SITE_URL } from "@/lib/business";
import {
  dbConfigured,
  recordKundenartAuswahl,
  type LeadKundenart,
} from "@/lib/db";
import { META_EREIGNISSE } from "@/lib/tracking/meta";
import { eventIdOderNeu, metaAnfrageKontext, sendeAnMeta } from "@/lib/tracking/meta-server";

const ziele: Record<LeadKundenart, string> = {
  privat: "/privatkunden",
  geschaeft: "/geschaeftskunden",
};

const metaEreignis: Record<LeadKundenart, typeof META_EREIGNISSE.weichePrivat | typeof META_EREIGNISSE.weicheGeschaeft> = {
  privat: META_EREIGNISSE.weichePrivat,
  geschaeft: META_EREIGNISSE.weicheGeschaeft,
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
 *
 * Seit 06.11.2026 zusätzlich der wichtigste Messpunkt für Meta: Mit
 * Marketing-Einwilligung (Cookie) geht KundenartGeschaeft bzw.
 * KundenartPrivat per Conversions API raus, ebenfalls in `after()`. Der
 * Browser meldet dasselbe Ereignis per Pixel; die gemeinsame event_id kommt
 * aus dem versteckten Feld, das KundenartFormular beim Absenden füllt. Aus
 * den Geschäftskunden entsteht die Lookalike-Zielgruppe für Kampagne 2.
 * Ohne Einwilligung bleibt es beim anonymen Zähler.
 */
export async function waehleKundenart(
  kundenart: LeadKundenart,
  formData: FormData,
): Promise<never> {
  const ziel = ziele[kundenart] ?? "/";

  if (kundenart in ziele) {
    if (dbConfigured) {
      after(async () => {
        try {
          await recordKundenartAuswahl(kundenart);
        } catch (error) {
          console.error("[ARIZU Kundenart-Auswahl]", error);
        }
      });
    }

    const kontext = await metaAnfrageKontext();
    if (kontext.erlaubt) {
      const eventId = eventIdOderNeu(formData.get("eventId"));
      after(() =>
        sendeAnMeta({
          name: metaEreignis[kundenart],
          eventId,
          kontext,
          url: kontext.referer ?? `${SITE_URL}/`,
          daten: { content_category: "Kundenart-Weiche" },
        }),
      );
    }
  }

  // redirect() wirft intern und muss deshalb außerhalb des try-Blocks stehen.
  redirect(ziel);
}
