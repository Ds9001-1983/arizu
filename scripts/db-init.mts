/* Tabelle und Index für die Lead-Inbox anlegen.
   Aufruf: npm run db:init
   Idempotent — kann jederzeit erneut laufen.

   Endung `.mts`, nicht `.ts`: `package.json` hat kein `"type": "module"`,
   deshalb hielte tsx eine `.ts` für CommonJS und das Top-Level-`await` unten
   bräche mit ERR_REQUIRE_ASYNC_MODULE ab. */

import { createRequire } from "node:module";
import { initSchema } from "../lib/db";

/* .env.local selbst laden. tsx bringt das nicht mit, das Script lief deshalb
   nur mit vorangestelltem DATABASE_URL=… — der README nennt aber schlicht
   `npm run db:init`. Bewusst @next/env und kein eigener Parser: Genau dieses
   Paket liest die Datei auch im Betrieb, inklusive der Escape-Regeln für `$`
   (siehe Kommentar in hash-password.mts). Ein zweiter Parser mit eigenen
   Eigenheiten wäre eine Fehlerquelle. */
const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as {
  loadEnvConfig: (dir: string, dev: boolean, logger: unknown) => void;
};
loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL fehlt — in .env.local eintragen oder voranstellen.");
  process.exit(1);
}

await initSchema();
console.log("Tabelle `leads` und Index sind vorhanden.");
