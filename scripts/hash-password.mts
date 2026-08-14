/* Passwort-Hash für den internen Bereich erzeugen.
   Aufruf: npm run hash:password "mein-langes-passwort"
   Ergebnis als ARIZU_ADMIN_PASSWORD_HASH in die Umgebung eintragen.

   Endung `.mts` — Begründung steht in db-init.mts. */

import { hashPassword } from "../lib/auth";

const password = process.argv[2];
if (!password) {
  console.error('Aufruf: npm run hash:password "<passwort>"');
  process.exit(1);
}
if (password.length < 12) {
  console.error("Bitte mindestens 12 Zeichen — der Bereich hängt an diesem einen Passwort.");
  process.exit(1);
}

const hash = await hashPassword(password);

/* Zwei Ausgaben, und das ist leider nötig.

   Der Hash trennt seine Felder mit `$` (`pbkdf2$210000$salt$hash`). Next.js
   liest .env-Dateien über @next/env, und das schickt jeden Wert durch
   dotenv-expand — `$210000` wird dort als Variablenreferenz gelesen und durch
   Leerstring ersetzt. Aus dem Hash wird stillschweigend Müll, der Login
   antwortet mit "Passwort stimmt nicht", und man sucht den Fehler beim
   Passwort statt bei der Datei. Anführungszeichen helfen nicht — weder
   einfache noch doppelte, geprüft mit @next/env selbst. Nur `\$` überlebt.

   In Vercel, Docker & Co. gibt es keine .env-Datei und damit keine Expansion:
   dort gehört der Rohwert hin, escapte Backslashes wären dort Teil des Werts. */
console.log(`\nFür .env.local — mit escapten Dollarzeichen:\n`);
console.log(`ARIZU_ADMIN_PASSWORD_HASH=${hash.replaceAll("$", "\\$")}\n`);
console.log(`Für Vercel und andere Oberflächen — der Rohwert:\n`);
console.log(`ARIZU_ADMIN_PASSWORD_HASH=${hash}\n`);
console.log("Dazu noch ein Sitzungsgeheimnis setzen, z.B.:");
console.log(`SESSION_SECRET=${crypto.randomUUID()}${crypto.randomUUID()}\n`);
