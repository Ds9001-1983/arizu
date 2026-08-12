import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * Schützt den internen Lead-Bereich.
 *
 * Heisst `proxy.ts`, nicht `middleware.ts`: Ab Next.js 16 ist Middleware in
 * Proxy umbenannt (gleiche Funktionsweise, neuer Dateiname) — die alte
 * Konvention warnt beim Build als veraltet.
 *
 * Die Prüfung läuft hier und nicht erst in der Seite: Ohne gültiges Cookie
 * wird gar keine Seite gerendert, es kann also auch nichts durchblitzen.
 * `verifySessionToken` nutzt nur Web Crypto und läuft deshalb auch hier.
 *
 * Bewusst nur als vorgelagerte Weiche gedacht — die eigentliche Autorisierung
 * hängt am signierten Cookie, das die Server Actions selbst setzen.
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(token, process.env.SESSION_SECRET);

  if (ok) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/intern/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Alles unter /intern ausser der Login-Seite selbst.
  matcher: ["/intern", "/intern/((?!login).*)"],
};
