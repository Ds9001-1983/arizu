import { after } from "next/server";
import { z } from "zod";
import { WEITERGEREICHTE_EREIGNISSE } from "@/lib/tracking/meta";
import { eventIdOderNeu, metaAnfrageKontext, sendeAnMeta } from "@/lib/tracking/meta-server";

/* ==================================================================
   Weitergabe von Browser-Ereignissen an die Conversions API.

   Seitenaufruf, Leistungsseite und Kontaktklick passieren im Browser. Der
   Pixel meldet sie dort, diese Route meldet dasselbe Ereignis mit derselben
   event_id serverseitig, damit Meta beide zusammenführt und Ereignisse auch
   dann ankommen, wenn ein Werbeblocker den Pixel aufhält.

   Ohne Marketing-Einwilligung im Cookie passiert hier nichts. Die Route
   antwortet trotzdem mit 204, damit sie von außen nicht verrät, ob jemand
   eingewilligt hat. Anfrage und Kundenart-Weiche laufen nicht über diese
   Route (siehe WEITERGEREICHTE_EREIGNISSE).
   ================================================================== */

export const runtime = "nodejs";

const eingabe = z.object({
  name: z.enum(WEITERGEREICHTE_EREIGNISSE),
  eventId: z.string().max(64),
  url: z.string().url().max(2000),
  daten: z.record(z.string().max(40), z.string().max(120)).optional(),
});

const leer = () => new Response(null, { status: 204 });

export async function POST(request: Request) {
  // Nur Aufrufe der eigenen Seite. Fehlt der Header (ältere Browser), wird
  // nicht abgewiesen; die Einwilligungsprüfung folgt ohnehin.
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return new Response(null, { status: 403 });
  }

  const kontext = await metaAnfrageKontext();
  if (!kontext.erlaubt) return leer();

  let roh: unknown;
  try {
    roh = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const geprueft = eingabe.safeParse(roh);
  if (!geprueft.success) return new Response(null, { status: 400 });
  const { name, eventId, url, daten } = geprueft.data;

  // Die Adresse muss zur eigenen Seite gehören, sonst ließe sich hier jede
  // beliebige URL als Quelle unterschieben.
  const host = request.headers.get("host");
  if (!host || new URL(url).host !== host) return new Response(null, { status: 400 });

  after(() =>
    sendeAnMeta({ name, eventId: eventIdOderNeu(eventId), kontext, url, daten }),
  );
  return leer();
}
