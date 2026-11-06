/* ==================================================================
   Meta-Pixel und Conversions API: Konstanten für Browser und Server.

   Datensatz „ARIZU Website“ im Business-Portfolio „ARIZU
   Gebäudedienstleistungen“, angelegt von Cowork am 06.11.2026. Die
   Pixel-ID ist öffentlich (sie steht in jedem Pixel-Aufruf), deshalb gibt
   es einen Rückfallwert im Code: So verhalten sich lokaler Build, QA-Lauf
   und Vercel gleich, auch wenn NEXT_PUBLIC_META_PIXEL_ID fehlt. Geheim ist
   nur der Zugriffsschlüssel der Conversions API (META_CAPI_TOKEN), und der
   liegt ausschließlich in Vercel und in .env.local.
   ================================================================== */

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1800673791361978";

/**
 * Alle Ereignisse, die die Seite an Meta meldet. Die Namen sind die
 * Schnittstelle zum Werbeanzeigenmanager: Die Website-Zielgruppen
 * (Geschäftskunden- und Privatkunden-Weiche) hängen an genau diesen
 * Zeichenketten. Nicht umbenennen, ohne die Zielgruppen mitzuziehen.
 */
export const META_EREIGNISSE = {
  seitenaufruf: "PageView",
  leistung: "ViewContent",
  kontakt: "Contact",
  anfrage: "Lead",
  weicheGeschaeft: "KundenartGeschaeft",
  weichePrivat: "KundenartPrivat",
} as const;

export type MetaEreignisName = (typeof META_EREIGNISSE)[keyof typeof META_EREIGNISSE];

/** Eigene Ereignisse laufen im Pixel über trackCustom, Standardereignisse über track. */
export const EIGENE_EREIGNISSE: readonly MetaEreignisName[] = [
  META_EREIGNISSE.weicheGeschaeft,
  META_EREIGNISSE.weichePrivat,
];

/**
 * Ereignisse, die der Browser über /api/meta an die Conversions API
 * weiterreicht. Anfrage und Weiche fehlen bewusst: Die meldet der Server
 * selbst (Anfrage-Route bzw. Server Action), damit niemand sie von außen
 * fälschen oder E-Mail und Telefon durch den Browser schicken muss.
 */
export const WEITERGEREICHTE_EREIGNISSE = [
  META_EREIGNISSE.seitenaufruf,
  META_EREIGNISSE.leistung,
  META_EREIGNISSE.kontakt,
] as const;

export type WeitergereichtesEreignis = (typeof WEITERGEREICHTE_EREIGNISSE)[number];

/** UUID v4 aus crypto.randomUUID(). Alles andere wird verworfen. */
export const EVENT_ID_MUSTER =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
