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

/**
 * Privat- oder Geschäftskunde.
 *
 * `null` heißt "nicht zugeordnet" und meint ausschließlich Anfragen, die vor
 * der Trennung eingegangen sind. Ein nachträgliches Auffüllen dieser Zeilen
 * wäre eine Behauptung — manche davon könnten Hausverwaltungen gewesen sein.
 * Deshalb bleiben sie leer und lassen sich im internen Bereich einzeln
 * zuordnen.
 */
export type LeadKundenart = "privat" | "geschaeft";

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
  kundenart: string | null;
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
      kundenart     text,
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
  await q`alter table leads add column if not exists kundenart text`;
  // Die Inbox sortiert immer nach Eingang — dafür ein Index, damit das auch
  // bei einigen Tausend Leads schnell bleibt.
  await q`create index if not exists leads_created_at_idx on leads (created_at desc)`;

  /* Preisüberschreibungen. Eine Zeile NUR je tatsächlich geändertem Satz —
     nicht das ganze Preisbild als Abzug. Sonst erreichte eine spätere
     Code-Änderung an einem Satz, den Arian nie angefasst hat, die Produktion
     nie mehr.

     `double precision`, nicht `numeric`: Der Neon-Treiber liefert `numeric`
     als STRING zurück. Ein übersehenes Number() ergäbe dann
     `preis += "0.90"`, also Zeichenkettenverkettung und absurde Beträge —
     und `check:pricing` fasst die Datenbank bewusst nicht an, würde es also
     nie fangen. `double precision` bildet außerdem exakt die Arithmetik der
     bisherigen Modulkonstanten ab.

     Neue Tabelle, deshalb keine begleitende `alter table`-Zeile — die
     Konvention oben gilt ab der ersten nachträglich ergänzten Spalte. */
  await q`
    create table if not exists preise (
      konfigurator text             not null,
      schluessel   text             not null,
      wert         double precision not null,
      geaendert_am timestamptz      not null default now(),
      primary key (konfigurator, schluessel)
    )
  `;

  /* Anonyme Auswahlzählung der beiden Wege auf der Startseite. Es werden
     weder einzelne Ereignisse noch IP-Adressen, Cookies oder Gerätekennungen
     gespeichert — nur zwei fortlaufende Summen. */
  await q`
    create table if not exists kundenart_auswahl (
      kundenart   text        primary key check (kundenart in ('privat', 'geschaeft')),
      anzahl      bigint      not null default 0,
      geaendert_am timestamptz not null default now()
    )
  `;
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
  kundenart?: string | null;
}): Promise<number> {
  const q = sql();
  const rows = (await q`
    insert into leads (name, phone, email, strasse, plz, ort, message, service,
                       konfigurator, source, kundenart)
    values (${lead.name}, ${lead.phone}, ${lead.email ?? null}, ${lead.strasse ?? null},
            ${lead.plz ?? null}, ${lead.ort ?? null}, ${lead.message ?? null},
            ${lead.service ?? null}, ${lead.konfigurator ?? null}, ${lead.source ?? null},
            ${lead.kundenart ?? null})
    returning id
  `) as { id: number }[];
  return rows[0].id;
}

/** Filterwert der Lead-Inbox. "ohne" meint die Zeilen von vor der Trennung. */
export type KundenartFilter = LeadKundenart | "ohne";

/**
 * Lead-Liste, optional nach Kundenart gefiltert.
 *
 * Gefiltert wird in SQL, nicht in JavaScript. Das ist keine Geschmacksfrage:
 * Die Abfrage ist auf 200 Zeilen begrenzt. Bei tausend Anfragen, deren
 * jüngste 200 zufällig alle privat sind, meldete ein Filter im Speicher
 * "keine Geschäftskunden" — obwohl es welche gibt. Ein Filter, der still
 * falsche Ergebnisse liefert, ist schlimmer als gar keiner.
 *
 * Zwei Eigenheiten, die hier sein müssen:
 * - `is not distinct from` statt `=`, sonst trifft der Vergleich mit NULL
 *   niemals eine Zeile und der Filter "ohne" käme immer leer zurück.
 * - Die Casts `::boolean` und `::text` sind Pflicht, nicht Zierde: Ohne sie
 *   kann Postgres bei einem NULL-Parameter den Typ nicht bestimmen und wirft.
 * So bleibt es EIN Tagged Template ohne zusammengebautes `where` — die Regel
 * aus dem Kommentar bei initSchema gilt weiter.
 */
export async function listLeads(
  limit = 200,
  filter?: KundenartFilter,
): Promise<LeadRow[]> {
  const q = sql();
  const alle = filter === undefined;
  const gesucht = filter === "ohne" ? null : (filter ?? null);
  return (await q`
    select id, created_at, name, phone, email, strasse, plz, ort, message,
           service, konfigurator, source, kundenart, status, note,
           rg_name, rg_strasse, rg_plz, rg_ort
      from leads
     where (${alle}::boolean or kundenart is not distinct from ${gesucht}::text)
     order by created_at desc
     limit ${limit}
  `) as LeadRow[];
}

export async function getLead(id: number): Promise<LeadRow | undefined> {
  const q = sql();
  const rows = (await q`
    select id, created_at, name, phone, email, strasse, plz, ort, message,
           service, konfigurator, source, kundenart, status, note,
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
    /* Wird nie geleert, nur zwischen zwei Werten umgeschaltet — deshalb ist
       das coalesce unten hier richtig und es braucht kein Gegenstück wie bei
       setBillingAddress. */
    kundenart?: LeadKundenart;
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
      kundenart    = coalesce(${patch.kundenart ?? null}, kundenart),
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

/* ================================================================ Statistik

   Arians Frage aus dem Gespräch: "welche Bereiche werden am meisten benutzt".
   Gezählt wird in SQL statt über die geladene Liste — die ist auf 200 Zeilen
   begrenzt und beantwortete damit eine andere Frage, nämlich "unter den
   letzten 200". Sobald der Betrieb läuft, wäre die Antwort still falsch.

   ACHTUNG bei den `::int`-Casts: `count(*)` ist in Postgres ein `bigint`, und
   der Neon-Treiber liefert `bigint` als STRING zurück — "12" statt 12. Ohne
   Cast liefe Math.max() über Zeichenketten und die Balkenbreiten wären
   Unsinn. Dasselbe gilt für jedes künftige count/sum in diesem Projekt.
   ================================================================== */

export type LeadZaehler = {
  gesamt: number;
  privat: number;
  geschaeft: number;
  ohne: number;
};

export async function countLeads(): Promise<LeadZaehler> {
  const q = sql();
  const rows = (await q`
    select count(*)::int                                       as gesamt,
           count(*) filter (where kundenart = 'privat')::int    as privat,
           count(*) filter (where kundenart = 'geschaeft')::int as geschaeft,
           count(*) filter (where kundenart is null)::int       as ohne
      from leads
  `) as LeadZaehler[];
  return rows[0] ?? { gesamt: 0, privat: 0, geschaeft: 0, ohne: 0 };
}

/* ---------------------------------------------------- Startseiten-Auswahl */

export type AuswahlZaehler = {
  privat: number;
  geschaeft: number;
  gesamt: number;
};

/* Der Produktions-Deploy kann vor `npm run db:init` online sein. Das erste
   Zählen legt die idempotente Zwei-Zeilen-Tabelle deshalb selbst an; das
   verhindert verlorene Klicks zwischen Deploy und Schema-Lauf. */
let auswahlSchemaReady: Promise<void> | undefined;

async function ensureAuswahlSchema(): Promise<void> {
  if (!auswahlSchemaReady) {
    auswahlSchemaReady = (async () => {
      const q = sql();
      await q`
        create table if not exists kundenart_auswahl (
          kundenart    text        primary key check (kundenart in ('privat', 'geschaeft')),
          anzahl       bigint      not null default 0,
          geaendert_am timestamptz not null default now()
        )
      `;
    })().catch((error) => {
      auswahlSchemaReady = undefined;
      throw error;
    });
  }
  await auswahlSchemaReady;
}

export async function recordKundenartAuswahl(kundenart: LeadKundenart): Promise<void> {
  await ensureAuswahlSchema();
  const q = sql();
  await q`
    insert into kundenart_auswahl (kundenart, anzahl, geaendert_am)
    values (${kundenart}, 1, now())
    on conflict (kundenart)
    do update set anzahl = kundenart_auswahl.anzahl + 1,
                  geaendert_am = now()
  `;
}

export async function countKundenartAuswahl(): Promise<AuswahlZaehler> {
  await ensureAuswahlSchema();
  const q = sql();
  const rows = (await q`
    select coalesce(sum(anzahl) filter (where kundenart = 'privat'), 0)::int
             as privat,
           coalesce(sum(anzahl) filter (where kundenart = 'geschaeft'), 0)::int
             as geschaeft
      from kundenart_auswahl
  `) as { privat: number; geschaeft: number }[];
  const privat = rows[0]?.privat ?? 0;
  const geschaeft = rows[0]?.geschaeft ?? 0;
  return { privat, geschaeft, gesamt: privat + geschaeft };
}

/* ============================================================ Preispflege */

export type PreisZeile = {
  konfigurator: string;
  schluessel: string;
  wert: number;
  geaendert_am: string;
};

/** Alle Überschreibungen in einem Rutsch — es sind höchstens rund 40. */
export async function listRateOverrides(): Promise<PreisZeile[]> {
  const q = sql();
  return (await q`
    select konfigurator, schluessel, wert, geaendert_am
      from preise
     order by konfigurator, schluessel
  `) as PreisZeile[];
}

export async function setRate(
  konfigurator: string,
  schluessel: string,
  wert: number,
): Promise<void> {
  const q = sql();
  await q`
    insert into preise (konfigurator, schluessel, wert, geaendert_am)
    values (${konfigurator}, ${schluessel}, ${wert}, now())
    on conflict (konfigurator, schluessel)
    do update set wert = excluded.wert, geaendert_am = now()
  `;
}

/** Zurücksetzen ist ein Löschen — danach gilt wieder der Wert aus dem Code. */
export async function clearRate(
  konfigurator: string,
  schluessel: string,
): Promise<void> {
  const q = sql();
  await q`delete from preise where konfigurator = ${konfigurator} and schluessel = ${schluessel}`;
}

export async function clearRates(konfigurator: string): Promise<void> {
  const q = sql();
  await q`delete from preise where konfigurator = ${konfigurator}`;
}

export type BereichZeile = {
  service: string | null;
  kundenart: string | null;
  anzahl: number;
};

export async function countByService(): Promise<BereichZeile[]> {
  const q = sql();
  return (await q`
    select service, kundenart, count(*)::int as anzahl
      from leads
     group by service, kundenart
     order by count(*) desc
  `) as BereichZeile[];
}
