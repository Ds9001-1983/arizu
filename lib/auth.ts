/* ==================================================================
   Zugang zum internen Lead-Bereich.

   Es gibt genau einen Nutzer: Arian. Eine Auth-Bibliothek mit Benutzer-
   tabelle, Rollen und OAuth-Providern wäre hier Ballast — das Passwort steht
   als PBKDF2-Hash in einer Umgebungsvariable.

   Ausschliesslich Web Crypto (`crypto.subtle`), kein `node:crypto`: Dieselben
   Funktionen laufen dadurch in der Middleware (Edge-Runtime) UND in Server
   Actions (Node). Sonst bräuchte es zwei Implementierungen derselben Prüfung.

   Passwort-Hash erzeugen: `npx tsx scripts/hash-password.ts "<passwort>"`
   ================================================================== */

export const SESSION_COOKIE = "arizu_intern";
const SESSION_MAX_AGE_S = 60 * 60 * 12; // ein Arbeitstag
const PBKDF2_ITERATIONS = 210_000;

const enc = new TextEncoder();

/* ------------------------------------------------------------- Hilfsmittel */

function toB64(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const byte of b) s += String.fromCharCode(byte);
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Vergleich in konstanter Zeit.
 *
 * Ein normaler `===` bricht beim ersten falschen Zeichen ab; aus den
 * Laufzeitunterschieden lässt sich ein Token zeichenweise erraten.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* -------------------------------------------------------------- Passwörter */

async function pbkdf2(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return toB64(bits);
}

/** Format: `pbkdf2$<iterationen>$<salt-b64>$<hash-b64>` */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toB64(salt)}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, saltB64, hashB64] = stored.split("$");
  if (scheme !== "pbkdf2" || !saltB64 || !hashB64) return false;
  if (Number(iterations) !== PBKDF2_ITERATIONS) {
    // Anderer Kostenfaktor: neu berechnen statt stillschweigend ablehnen.
    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
      "deriveBits",
    ]);
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: fromB64(saltB64) as BufferSource,
        iterations: Number(iterations),
        hash: "SHA-256",
      },
      key,
      256,
    );
    return timingSafeEqual(toB64(bits), hashB64);
  }
  return timingSafeEqual(await pbkdf2(password, fromB64(saltB64)), hashB64);
}

/* --------------------------------------------------------------- Sitzungen */

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toB64(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
}

/**
 * Signiertes Token statt Serverspeicher: `<ablauf-ms>.<signatur>`.
 * Der Ablauf steckt IM signierten Teil, kann also nicht manipuliert werden.
 */
export async function createSessionToken(secret: string): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE_S * 1000;
  return `${expires}.${await hmac(String(expires), secret)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret) return false;
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!expiresRaw || !signature || !Number.isFinite(expires)) return false;
  if (Date.now() > expires) return false;
  return timingSafeEqual(await hmac(expiresRaw, secret), signature);
}

export const sessionMaxAge = SESSION_MAX_AGE_S;

/** Beide ENV-Werte müssen gesetzt sein, sonst ist der Bereich komplett zu. */
export function authConfigured(): boolean {
  return Boolean(process.env.ARIZU_ADMIN_PASSWORD_HASH && process.env.SESSION_SECRET);
}
