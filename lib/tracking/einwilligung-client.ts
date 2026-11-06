import { useSyncExternalStore } from "react";
import {
  EINWILLIGUNG_COOKIE,
  EINWILLIGUNG_MAX_AGE_S,
  einwilligungWert,
  leseEinwilligung,
  type Einwilligung,
} from "./einwilligung";

/* ==================================================================
   Einwilligung im Browser: lesen, setzen, widerrufen.

   Kein Fremdtool (Consent-Management-Plattform): Es gibt genau einen
   einwilligungspflichtigen Dienst, und ein eigener Banner kostet ein paar
   KB statt eines fremden Skripts im kritischen Pfad. Muster wie bei Frank
   Nöller (Entscheidung Dennis, 02.11.2026), hier mit Cookie statt
   localStorage, weil der Server die Auswahl lesen muss.
   ================================================================== */

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & Record<string, unknown>;
    _fbq?: unknown;
  }
}

const EREIGNIS = "arizu:einwilligung";

/** Über „Cookie-Einstellungen“ im Fuß wieder geöffnet. */
let erneutGeoeffnet = false;
/** Der Knopf, der den Banner wieder geöffnet hat. Bekommt danach den Fokus zurück. */
let ausloeser: HTMLElement | null = null;

function cookieLesen(): string | undefined {
  const praefix = `${EINWILLIGUNG_COOKIE}=`;
  return document.cookie
    .split("; ")
    .find((teil) => teil.startsWith(praefix))
    ?.slice(praefix.length);
}

export function aktuelleEinwilligung(): Einwilligung | null {
  if (typeof document === "undefined") return null;
  return leseEinwilligung(cookieLesen());
}

export function marketingErlaubtJetzt(): boolean {
  return aktuelleEinwilligung()?.marketing === true;
}

function abonnieren(beiAenderung: () => void) {
  window.addEventListener(EREIGNIS, beiAenderung);
  return () => window.removeEventListener(EREIGNIS, beiAenderung);
}

export function useMarketingErlaubt(): boolean {
  return useSyncExternalStore(
    abonnieren,
    marketingErlaubtJetzt,
    () => false, // Server: nie eine Einwilligung annehmen
  );
}

export type BannerZustand = "zu" | "erstbesuch" | "erneut";

export function useBannerZustand(): BannerZustand {
  return useSyncExternalStore(
    abonnieren,
    (): BannerZustand =>
      erneutGeoeffnet ? "erneut" : aktuelleEinwilligung() ? "zu" : "erstbesuch",
    // Erst nach der Hydration zeigen: Der Server kennt das Cookie nicht (die
    // Seiten bleiben statisch), das Markup muss beim ersten Rendern passen.
    (): BannerZustand => "zu",
  );
}

export function einwilligungSpeichern(marketing: boolean) {
  const sicher = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${EINWILLIGUNG_COOKIE}=${einwilligungWert(marketing)}; Path=/; ` +
    `Max-Age=${EINWILLIGUNG_MAX_AGE_S}; SameSite=Lax${sicher}`;

  // Lief der Pixel schon auf dieser Seite, erfährt er die neue Auswahl sofort.
  window.fbq?.("consent", marketing ? "grant" : "revoke");
  if (!marketing) metaCookiesLoeschen();

  schliessen();
}

export function einwilligungOeffnen() {
  ausloeser = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  erneutGeoeffnet = true;
  window.dispatchEvent(new Event(EREIGNIS));
}

/** Wieder geöffneten Banner ohne Änderung schließen. */
export function einwilligungSchliessen() {
  schliessen();
}

function schliessen() {
  const zurueck = ausloeser;
  ausloeser = null;
  erneutGeoeffnet = false;
  window.dispatchEvent(new Event(EREIGNIS));
  // Fokus zurück auf „Cookie-Einstellungen“ im Fuß, sonst stünde er nach dem
  // Schließen am Seitenanfang.
  if (zurueck?.isConnected) zurueck.focus();
}

/** Widerruf: die Kennungen des Pixels sofort entfernen, nicht erst nach Ablauf. */
function metaCookiesLoeschen() {
  const domain = location.hostname.replace(/^www\./, "");
  for (const name of ["_fbp", "_fbc"]) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${domain}`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${location.hostname}`;
  }
}
