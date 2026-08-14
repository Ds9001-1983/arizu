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
  /* Rechnungsadresse. Kommt nie aus dem Formular, sondern wird von Arian
     nachgetragen — beim Vor-Ort-Termin oder am Telefon. Kann vom Einsatzort
     abweichen: Erbengemeinschaft, Hausverwaltung, Firmensitz des Vermieters. */
  rg_name: string | null;
  rg_strasse: string | null;
  rg_plz: string | null;
  rg_ort: string | null;
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
      note          text,
      rg_name       text,
      rg_strasse    text,
      rg_plz        text,
      rg_ort        text
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
  await q`alter table leads add column if not exists rg_name text`;
  await q`alter table leads add column if not exists rg_strasse text`;
  await q`alter table leads add column if not exists rg_plz text`;
  await q`alter table leads add column if not exists rg_ort text`;
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
           service, konfigurator, source, status, note,
           rg_name, rg_strasse, rg_plz, rg_ort
      from leads
     order by created_at desc
     limit ${limit}
  `) as LeadRow[];
}

export async function getLead(id: number): Promise<LeadRow | undefined> {
  const q = sql();
  const rows = (await q`
    select id, created_at, name, phone, email, strasse, plz, ort, message,
           service, konfigurator, source, status, note,
           rg_name, rg_strasse, rg_plz, rg_ort
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

/**
 * Rechnungsadresse setzen.
 *
 * Eigene Funktion statt eines weiteren Feldes in updateLead: Dort arbeitet
 * jedes Feld mit `coalesce`, behält also den alten Wert, wenn nichts kommt.
 * Das ist für Teil-Updates richtig — hier aber falsch, denn Arian muss eine
 * einmal eingetragene Rechnungsadresse auch wieder leeren können. Diese
 * Felder werden deshalb bedingungslos geschrieben.
 */
export async function setBillingAddress(
  id: number,
  rg: { name: string; strasse: string; plz: string; ort: string },
): Promise<void> {
  const q = sql();
  const leer = (v: string) => (v.trim() === "" ? null : v.trim());
  await q`
    update leads set
      rg_name    = ${leer(rg.name)},
      rg_strasse = ${leer(rg.strasse)},
      rg_plz     = ${leer(rg.plz)},
      rg_ort     = ${leer(rg.ort)}
    where id = ${id}
  `;
}
