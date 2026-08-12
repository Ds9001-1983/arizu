import localFont from "next/font/local";

/* ==================================================================
   Schriften selbst gehostet — nicht über next/font/google.

   Grund ist ein konkreter Ausfall: Am 12.08.2026 schlug der Vercel-Build
   fehl, weil fonts.gstatic.com für die von Next angefragten Manrope-Dateien
   404 lieferte. Google hatte die Datei-URLs rotiert. Derselbe Commit hatte
   sechs Minuten vorher noch gebaut — ein Build, der von fremden CDN-URLs
   abhängt, ist also nicht reproduzierbar.

   Selbst gehostet heißt: Der Build braucht kein Netz, kann nicht durch
   Änderungen bei Google brechen, und die Aussage in der Datenschutz-
   erklärung ("Schriften werden von unserem eigenen Server geladen, keine
   Verbindung zu Google") stimmt auch auf Quellebene.

   Beides sind variable Fonts, also je eine Datei für den kompletten
   Gewichtsbereich statt sieben Einzelschnitte.
   Muster übernommen aus lib/fonts.ts des Jafari-Projekts.
   ================================================================== */

/** Display: Archivo — kompakt, industriell, passt zu Gebäudedienstleistung. */
export const archivo = localFont({
  src: [{ path: "../app/fonts/archivo-var.woff2", weight: "600 800", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/** UI und Fließtext: Manrope — gut lesbar auf kleinen Screens. */
export const manrope = localFont({
  src: [{ path: "../app/fonts/manrope-var.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
