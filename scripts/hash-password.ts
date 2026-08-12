/* Passwort-Hash für den internen Bereich erzeugen.
   Aufruf: npx tsx scripts/hash-password.ts "mein-langes-passwort"
   Ergebnis als ARIZU_ADMIN_PASSWORD_HASH in die Umgebung eintragen. */

import { hashPassword } from "../lib/auth";

const password = process.argv[2];
if (!password) {
  console.error('Aufruf: npx tsx scripts/hash-password.ts "<passwort>"');
  process.exit(1);
}
if (password.length < 12) {
  console.error("Bitte mindestens 12 Zeichen — der Bereich hängt an diesem einen Passwort.");
  process.exit(1);
}

console.log(`\nARIZU_ADMIN_PASSWORD_HASH=${await hashPassword(password)}\n`);
console.log("Dazu noch ein Sitzungsgeheimnis setzen, z.B.:");
console.log(`SESSION_SECRET=${crypto.randomUUID()}${crypto.randomUUID()}\n`);
