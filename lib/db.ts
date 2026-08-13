import { neon } from "@neondatabase/serverless";

/* ==================================================================
   Lead-Speicher (Neon Postgres).

   Bewusst ohne ORM: In keinem Projekt im DEV-Ordner steckt einer, und für
   eine Tabelle mit zwölf Spalten wäre er reiner Ballast. Der Neon-Treiber
   escapet Parameter in Tagged Templates selbst — String-Konkatenation gibt
   es hier nirgends.

   Ohne DATABASE_URL läuft alles im Demo-Modus: Die Seite bleibt lauffähig,
   Leads gehen dann ausschließlich per Mail und ins Log. Das ist Absicht,
   damit der Prototyp ohne Secrets baut und deployt.
   ================================================================== */

export const dbConfigured = Boolean(process.env.DATABASE_URL);

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ist nicht gesetzt.");
  return neon(url);
}

export type LeadStatus = "neu" | "kontaktiert" | "angebot" | "gewonnen" | "verloren";

export type LeadRow = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  message: string | null;
  service: string | null;
  konfigurator: string | null;
  source: string | null;
  status: LeadStatus;
  note: string | null;
};

export async function initSchema(): Promise<void> {
  const q = sql();
  await q`
    create table if not exists leads (
      id            serial primary key,
      created_at    timestamptz not null default now(),
      name          text        not null,
      phone         text        not null,
      email         text,
      strasse       text,
      plz           text,
      ort           text,
      message       text,
      service       text,
      konfigurator  text,
      source        text,
      status        text        not null default 'neu',
      note          text
    )
  `;
  // Nachträglich hinzugekommene Spalten. Ausgeschrieben statt in einer
  // Schleife, weil der Neon-Treiber ausschließlich Tagged Templates annimmt —
  // ein zusammengebauter String würde hier gar nicht erst kompilieren, und
  // das ist gut so: Spaltennamen aus Variablen wären ein SQL-Injection-Weg.
  await q`alter table leads add column if not exists strasse text`;
  await q`alter table leads add column if not exists plz text`;
  await q`alter table leads add column if not exists ort text`;
  await q`alter table leads add column if not exists source text`;
  // Die Inbox sortiert immer nach Eingang — dafür ein Index, damit das auch
  // bei einigen Tausend Leads schnell bleibt.
  await q`create index if not exists leads_created_at_idx on leads (created_at desc)`;
}

export async function insertLead(lead: {
  name: string;
  phone: string;
  email?: string | null;
  strasse?: string | null;
  plz?: string | null;
  ort?: string | null;
  message?: string | null;
  service?: string | null;
  konfigurator?: string | null;
  source?: string | null;
}): Promise<number> {
  const q = sql();
  const rows = (await q`
    insert into leads (name, phone, email, strasse, plz, ort, message, service,
                       konfigurator, source)
    values (${lead.name}, ${lead.phone}, ${lead.email ?? null}, ${lead.strasse ?? null},
            ${lead.plz ?? null}, ${lead.ort ?? null}, ${lead.message ?? null},
            ${lead.service ?? null}, ${lead.konfigurator ?? null}, ${lead.source ?? null})
    returning id
  `) as { id: number }[];
  return rows[0].id;
}

export async function listLeads(limit = 200): Promise<LeadRow[]> {
  const q = sql();
  return (await q`
    select id, created_at, name, phone, email, strasse, plz, ort, message,
           service, konfigurator, source, status, note
      from leads
     order by created_at desc
     limit ${limit}
  `) as LeadRow[];
}

export async function getLead(id: number): Promise<LeadRow | undefined> {
  const q = sql();
  const rows = (await q`
    select id, created_at, name, phone, email, strasse, plz, ort, message,
           service, konfigurator, source, status, note
      from leads
     where id = ${id}
  `) as LeadRow[];
  return rows[0];
}

/**
 * Lead nachbearbeiten. Deckt das Szenario aus dem Kundengespräch ab: Arian
 * steht beim Kunden, die Wohnung hat 74 m² statt der gemeldeten 60 — er
 * korrigiert die Angabe direkt am Handy, statt sie sich zu notieren.
 */
export async function updateLead(
  id: number,
  patch: {
    name?: string;
    phone?: string;
    email?: string | null;
    strasse?: string | null;
    plz?: string | null;
    ort?: string | null;
    konfigurator?: string | null;
    status?: LeadStatus;
    note?: string | null;
  },
): Promise<void> {
  const q = sql();
  // coalesce: nur übergebene Felder ändern, der Rest bleibt wie er ist.
  await q`
    update leads set
      name         = coalesce(${patch.name ?? null}, name),
      phone        = coalesce(${patch.phone ?? null}, phone),
      email        = coalesce(${patch.email ?? null}, email),
      strasse      = coalesce(${patch.strasse ?? null}, strasse),
      plz          = coalesce(${patch.plz ?? null}, plz),
      ort          = coalesce(${patch.ort ?? null}, ort),
      konfigurator = coalesce(${patch.konfigurator ?? null}, konfigurator),
      status       = coalesce(${patch.status ?? null}, status),
      note         = coalesce(${patch.note ?? null}, note)
    where id = ${id}
  `;
}
