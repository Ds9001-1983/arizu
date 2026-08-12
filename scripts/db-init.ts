/* Tabelle und Index für die Lead-Inbox anlegen.
   Aufruf: DATABASE_URL="postgres://…" npx tsx scripts/db-init.ts
   Idempotent — kann jederzeit erneut laufen. */

import { initSchema } from "../lib/db";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL fehlt.");
  process.exit(1);
}

await initSchema();
console.log("Tabelle `leads` und Index sind vorhanden.");
