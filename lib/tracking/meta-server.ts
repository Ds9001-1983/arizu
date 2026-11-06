import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { EINWILLIGUNG_COOKIE, marketingErlaubt } from "./einwilligung";
import { EVENT_ID_MUSTER, META_PIXEL_ID, type MetaEreignisName } from "./meta";

/* ==================================================================
   Conversions API (serverseitig).

   Nur auf dem Server importieren: Hier wird META_CAPI_TOKEN gelesen.
   `import "server-only"` lässt den Build scheitern, falls die Datei je in
   einer Client-Komponente landet.

   Gesendet wird nur, wenn
   1. das Einwilligungs-Cookie eine Marketing-Einwilligung trägt (prüft der
      Aufrufer über metaAnfrageKontext().erlaubt),
   2. META_CAPI_TOKEN gesetzt ist und
   3. die Umgebung Production ist oder ein META_TEST_EVENT_CODE gesetzt ist.

   Punkt 3 verhindert, dass `npm run qa` oder eine Vercel-Vorschau echte
   Ereignisse in den Datensatz schreibt. Mit Testcode landen sie nur im Tab
   „Ereignisse testen“ des Events Managers. In Production wird ein Testcode
   bewusst ignoriert: Ein vergessener Testcode machte sonst jedes echte
   Ereignis zum Testereignis, und die Kampagne hätte keine Daten.

   Der Zugriffsschlüssel steht im JSON-Body und nicht in der URL. So taucht
   er in keiner Fehlermeldung und keinem Log mit der angefragten Adresse auf.
   Geloggt wird bei Fehlern nur der HTTP-Status.
   ================================================================== */

// Neueste Version laut Graph-API-Changelog am 06.11.2026: v26.0 vom
// 29.07.2026, noch ohne Ablaufdatum (v25.0 läuft bis 29.07.2028). Meta
// schaltet alte Versionen nach rund zwei Jahren ab; dann hier anheben.
// developers.facebook.com/docs/graph-api/changelog/versions/
const GRAPH_API_VERSION = "v26.0";

export type MetaKontext = {
  /** Marketing-Einwilligung laut Cookie. */
  erlaubt: boolean;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  /** Seite, von der die Anfrage kam (Referer, nur eigene Domain). */
  referer?: string;
};

/** Liest Einwilligung, Meta-Cookies, IP und User-Agent der laufenden Anfrage. */
export async function metaAnfrageKontext(): Promise<MetaKontext> {
  const [h, c] = await Promise.all([headers(), cookies()]);
  const erlaubt = marketingErlaubt(c.get(EINWILLIGUNG_COOKIE)?.value);
  if (!erlaubt) return { erlaubt: false };

  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
  const host = h.get("host");
  const refererRoh = h.get("referer");
  let referer: string | undefined;
  if (refererRoh && host) {
    try {
      if (new URL(refererRoh).host === host) referer = refererRoh;
    } catch {
      // ungültiger Referer: weglassen
    }
  }

  return {
    erlaubt,
    ip,
    userAgent: h.get("user-agent") ?? undefined,
    fbp: c.get("_fbp")?.value,
    fbc: c.get("_fbc")?.value,
    referer,
  };
}

/** Nimmt die Event-ID aus dem Browser, wenn sie eine UUID ist, sonst eine neue. */
export function eventIdOderNeu(wert: unknown): string {
  return typeof wert === "string" && EVENT_ID_MUSTER.test(wert) ? wert : randomUUID();
}

export function capiAktiv(): boolean {
  if (!process.env.META_CAPI_TOKEN) return false;
  return process.env.VERCEL_ENV === "production" || Boolean(process.env.META_TEST_EVENT_CODE);
}

const sha256 = (wert: string) => createHash("sha256").update(wert).digest("hex");

/**
 * Telefonnummer nach Metas Vorgabe: nur Ziffern, mit Ländervorwahl, ohne
 * führende Nullen. Deutsche Nummern ohne Vorwahl bekommen die 49.
 */
export function telefonNormalisieren(telefon: string): string {
  let ziffern = telefon.replace(/\D/g, "");
  if (ziffern.startsWith("00")) ziffern = ziffern.slice(2);
  else if (ziffern.startsWith("0")) ziffern = `49${ziffern.slice(1)}`;
  return ziffern;
}

/**
 * _fbc fehlt, wenn der Pixel noch nie lief (Einwilligung erst auf einer
 * späteren Seite). Steht die fbclid noch in der Adresse, lässt sich der Wert
 * im Format von Meta nachbilden: fb.1.<Zeit in ms>.<fbclid>.
 */
function fbcAusAdresse(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const fbclid = new URL(url).searchParams.get("fbclid");
    return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
  } catch {
    return undefined;
  }
}

export type MetaServerEreignis = {
  name: MetaEreignisName;
  eventId: string;
  kontext: MetaKontext;
  /** Adresse der Seite, auf der das Ereignis passierte. */
  url?: string;
  /** Nur beim Lead: wird gehasht, nie im Klartext gesendet. */
  email?: string;
  telefon?: string;
  daten?: Record<string, string>;
};

/**
 * Schickt ein Ereignis an die Conversions API. Wirft nie: Ein Ausfall bei
 * Meta darf keine Anfrage und keine Weiterleitung kosten. Aufrufer rufen das
 * in after() auf, damit der Besucher nicht auf Meta wartet.
 */
export async function sendeAnMeta(ereignis: MetaServerEreignis): Promise<void> {
  const { kontext } = ereignis;
  if (!kontext.erlaubt || !capiAktiv()) return;

  const nutzer: Record<string, unknown> = {};
  if (kontext.ip) nutzer.client_ip_address = kontext.ip;
  if (kontext.userAgent) nutzer.client_user_agent = kontext.userAgent;
  if (kontext.fbp) nutzer.fbp = kontext.fbp;
  const fbc = kontext.fbc ?? fbcAusAdresse(ereignis.url);
  if (fbc) nutzer.fbc = fbc;
  if (ereignis.email) nutzer.em = [sha256(ereignis.email.trim().toLowerCase())];
  if (ereignis.telefon) {
    const telefon = telefonNormalisieren(ereignis.telefon);
    if (telefon) nutzer.ph = [sha256(telefon)];
  }

  const testCode =
    process.env.VERCEL_ENV === "production" ? undefined : process.env.META_TEST_EVENT_CODE;

  const body = {
    data: [
      {
        event_name: ereignis.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: ereignis.eventId,
        action_source: "website",
        event_source_url: ereignis.url,
        user_data: nutzer,
        ...(ereignis.daten ? { custom_data: ereignis.daten } : {}),
      },
    ],
    ...(testCode ? { test_event_code: testCode } : {}),
    access_token: process.env.META_CAPI_TOKEN,
  };

  try {
    const antwort = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!antwort.ok) {
      // Metas Fehlertext enthält den Schlüssel nicht, hilft aber bei der
      // Suche (z. B. „Invalid OAuth access token“, falscher Parameter).
      const fehler = (await antwort.json().catch(() => null)) as {
        error?: { code?: number; message?: string };
      } | null;
      console.error(
        `[ARIZU Meta] ${ereignis.name} abgelehnt: HTTP ${antwort.status}`,
        fehler?.error?.code ?? "",
        fehler?.error?.message?.slice(0, 200) ?? "",
      );
    }
  } catch {
    console.error(`[ARIZU Meta] ${ereignis.name} nicht gesendet (Netzwerk/Zeitüberschreitung)`);
  }
}
