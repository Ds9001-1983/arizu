import { marketingErlaubtJetzt } from "./einwilligung-client";
import {
  EIGENE_EREIGNISSE,
  META_PIXEL_ID,
  type MetaEreignisName,
  type WeitergereichtesEreignis,
} from "./meta";

/* ==================================================================
   Meta im Browser: Pixel laden und Ereignisse melden.

   Jede Funktion prüft die Einwilligung selbst, im Moment des Aufrufs. Ohne
   Marketing-Einwilligung wird weder der Pixel geladen noch ein Ereignis
   gemeldet, auch nicht an /api/meta.

   Jedes Ereignis bekommt eine event_id. Dieselbe ID geht an den Pixel
   (eventID) und an die Conversions API (event_id), daran erkennt Meta das
   Paar und zählt es einmal.
   ================================================================== */

export function neueEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Nur für sehr alte Browser ohne randomUUID: Format einer UUID v4.
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
  );
}

/**
 * Pixel-Code von Meta, ausgeschrieben statt als Inline-Skript. Eine
 * Abweichung vom Standard-Schnipsel: autoConfig aus. Der Pixel sammelt
 * keine Klicks und Seitendaten auf eigene Faust („automatische Ereignisse“),
 * nur was hier gemeldet wird.
 *
 * Seitenwechsel ohne Neuladen meldet der Pixel selbst (er hängt sich an
 * history.pushState). Ein manueller PageView kommt pro Seitenaufruf nur
 * einmal durch: fbevents.js führt dafür ein Set und lässt weitere nur für
 * seine eigenen automatischen PageViews zu (geprüft am 06.11.2026 an
 * Version 2.9.437). disablePushState war deshalb ein Fehler, danach fehlten
 * die PageViews aller Folgeseiten. Den ersten PageView mit event_id meldet
 * MetaTracking.
 */
export function pixelLaden() {
  if (!marketingErlaubtJetzt()) return;
  if (window.fbq) {
    window.fbq("consent", "grant");
    return;
  }
  const fbq = function (...args: unknown[]) {
    const self = fbq as unknown as {
      callMethod?: (...a: unknown[]) => void;
      queue: unknown[][];
    };
    if (self.callMethod) self.callMethod(...args);
    else self.queue.push(args);
  } as NonNullable<Window["fbq"]>;
  Object.assign(fbq, { push: fbq, loaded: true, version: "2.0", queue: [] });
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const skript = document.createElement("script");
  skript.async = true;
  skript.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(skript);

  fbq("set", "autoConfig", false, META_PIXEL_ID);
  fbq("init", META_PIXEL_ID);
}

/** Nur den Pixel bedienen. Für Ereignisse, die der Server selbst an die CAPI meldet. */
export function pixelEreignis(
  name: MetaEreignisName,
  eventId: string,
  daten: Record<string, string> = {},
) {
  if (!marketingErlaubtJetzt()) return;
  const art = EIGENE_EREIGNISSE.includes(name) ? "trackCustom" : "track";
  window.fbq?.(art, name, daten, { eventID: eventId });
}

/** Pixel und Conversions API (über /api/meta) mit derselben event_id. */
export function metaEreignis(name: WeitergereichtesEreignis, daten?: Record<string, string>) {
  if (!marketingErlaubtJetzt()) return;
  const eventId = neueEventId();
  pixelEreignis(name, eventId, daten);
  // keepalive: Beim Klick auf WhatsApp verlässt der Browser evtl. gleich die Seite.
  fetch("/api/meta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, eventId, url: location.href, daten }),
    keepalive: true,
  }).catch(() => {
    // Messung darf nie stören.
  });
}
