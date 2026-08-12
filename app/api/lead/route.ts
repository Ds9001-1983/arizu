import { NextResponse } from "next/server";
import { dbConfigured, insertLead } from "@/lib/db";
import { leadSchema } from "@/lib/lead-schema";
import { sendLeadMails } from "@/lib/mail";

/* nodemailer und der Neon-Treiber brauchen die Node-Runtime, nicht Edge. */
export const runtime = "nodejs";

/**
 * Sehr einfache Drosselung pro IP.
 *
 * Auf Vercel lebt dieser Speicher nur innerhalb einer Instanz und wird beim
 * Kaltstart geleert — gegen verteilte Angriffe hilft das nicht. Es bremst
 * aber das häufigste Muster: ein Bot, der dasselbe Formular im Sekundentakt
 * abschickt. Der Honeypot im Schema fängt den Rest.
 */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unbekannt";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Zu viele Anfragen in kurzer Zeit." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ungültige Eingabe." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Honeypot ausgefüllt -> Bot. Freundlich "erfolgreich" antworten und
  // nichts tun, damit der Bot nicht merkt, dass er erkannt wurde.
  if (data.website) return NextResponse.json({ ok: true });

  const lead = {
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    objekt: data.objekt || undefined,
    message: data.message || undefined,
    service: data.service || undefined,
    konfigurator: data.konfigurator || undefined,
  };

  // Reihenfolge und Fehlerbehandlung sind hier das Wesentliche: Ein Lead darf
  // niemals verloren gehen, nur weil ein Teilsystem ausfällt. Datenbank und
  // Mailversand scheitern deshalb unabhängig voneinander, und mindestens das
  // Log behält den Datensatz.
  let id: number | undefined;
  let stored = false;
  if (dbConfigured) {
    try {
      id = await insertLead(lead);
      stored = true;
    } catch (err) {
      console.error("[ARIZU] Lead konnte nicht gespeichert werden:", err, lead);
    }
  }

  const mail = await sendLeadMails({ ...lead, id });

  if (!stored && !mail.internal) {
    // Weder Datenbank noch Mail — der Kunde darf nicht glauben, alles sei gut.
    // Der Lead steht immerhin im Log (Vercel-Logs), aber verlassen kann sich
    // darauf niemand, also klare Ansage mit Telefonnummer.
    console.error("[ARIZU] Lead NICHT zugestellt:", JSON.stringify(lead));
    if (!mail.demo) {
      return NextResponse.json(
        {
          ok: false,
          error: "Die Anfrage konnte nicht übermittelt werden.",
        },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ ok: true, id });
}
