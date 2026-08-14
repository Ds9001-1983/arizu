import nodemailer, { type Transporter } from "nodemailer";
import { business, SITE_URL } from "./business";
import { getService } from "./services";

/* ==================================================================
   HTML-Mails über SMTP.

   Zwei Mails pro Anfrage, wie im Kundengespräch zugesagt:
     1. an Arian — alles auf einen Blick, Nummer als Klick-to-Call
     2. an den Kunden — gebrandet statt "blödes Textdokument"

   Muster: lib/mail.ts aus dem Phoenixmakler-Projekt (nodemailer + esc()).
   Ohne SMTP-ENV läuft der Demo-Modus: es wird geloggt statt gesendet, damit
   der Prototyp ohne Secrets funktioniert.

   Tabellen-Layout und Inline-Styles sind bei E-Mail Pflicht, nicht Nostalgie:
   Outlook rendert mit der Word-Engine, kein Flexbox, kein Grid, kein SVG.
   Deshalb liegt das Logo als PNG auf dem Server.
   ================================================================== */

const NAVY = "#0b1a2f";
const GOLD = "#c99b46";
const SHELL = "#f5f3ef";

let cached: Transporter | null = null;

type Smtp = { host: string; port: number; user: string; pass: string; from: string };

/* Überall `||` und nicht `??`, und das ist hier kein Schludern.

   Eine .env-Zeile ohne Wert (`LEAD_TO=`) ergibt einen LEEREN STRING, nicht
   `undefined` — und `??` greift nur bei `undefined`. Mit `??` würde aus
   `LEAD_TO=` also der Empfänger "", die Betriebsmail ginge ins Nichts und
   scheiterte still im catch weiter unten. Genau diese leeren Zuweisungen
   liefert .env.example aus, und der README sagt `cp .env.example .env.local`.
   Wer der Anleitung folgt, bekäme also einen kaputten Mailversand.

   `||` behandelt den leeren String wie "nicht gesetzt". Das ist die
   Bedeutung, die eine .env-Datei ihm ohnehin gibt. Bitte nicht auf `??`
   "modernisieren". */

function readSmtp(): Smtp | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    user,
    pass,
    from: process.env.MAIL_FROM || user,
  };
}

export const mailConfigured = () => readSmtp() !== null;

function transport(cfg: Smtp): Transporter {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  return cached;
}

/** HTML-Escaping — Kundeneingaben landen im Mail-Body. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Zeilenumbrüche aus Textareas erhalten. */
function nl2br(s: string): string {
  return esc(s).replace(/\r?\n/g, "<br />");
}

// Die Domain ist seit dem 14.08.2026 live und liefert das Logo aus, der
// Rückfall greift also von selbst — auch aus Vorschau-Deployments, weil die
// URL öffentlich ist. MAIL_LOGO_URL ist deshalb überall entfernt und nur noch
// dafür da, das Bild bei Bedarf woandershin zu legen.
const logoUrl =
  process.env.MAIL_LOGO_URL || `${SITE_URL}/brand/logo-arizu-signatur.png`;

export type LeadMail = {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  message?: string;
  service?: string;
  konfigurator?: string;
  source?: string;
  kundenart?: string;
};

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e5df;vertical-align:top;
                 font:600 13px/1.5 Arial,sans-serif;color:#4a5568;width:38%">${esc(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e5df;vertical-align:top;
                 font:400 14px/1.6 Arial,sans-serif;color:${NAVY}">${value}</td>
    </tr>`;
}

function shell(title: string, inner: string, preheader: string): string {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${SHELL}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SHELL}">
  <tr><td align="center" style="padding:28px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0"
           style="width:600px;max-width:100%;background:#ffffff;border:1px solid #e8e5df">
      <tr><td style="padding:26px 32px 22px;border-bottom:3px solid ${GOLD}">
        <img src="${logoUrl}" alt="${esc(business.name)}" width="200"
             style="display:block;width:200px;max-width:60%;height:auto;border:0" />
      </td></tr>
      ${inner}
      <tr><td style="padding:22px 32px;background:${NAVY}">
        <p style="margin:0;font:400 12px/1.7 Arial,sans-serif;color:rgba(255,255,255,.72)">
          ${esc(business.name)}${business.address.street ? ` · ${esc(business.address.street)}` : ""}
          · ${esc(business.address.postalCode)} ${esc(business.address.city)}<br />
          <a href="${business.phone.href}" style="color:${GOLD};text-decoration:none">${esc(business.phone.display)}</a>
          · <a href="mailto:${esc(business.email)}" style="color:${GOLD};text-decoration:none">${esc(business.email)}</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/* ------------------------------------------------------ Mail an den Betrieb */

function internalHtml(lead: LeadMail): string {
  const serviceName = lead.service ? getService(lead.service)?.name : undefined;
  const gewerbe = lead.kundenart === "geschaeft";
  const rows = [
    // Bewusst als erste Zeile und unbedingt, nicht nur bei Gewerbe: In einer
    // Tabelle, die Arian täglich überfliegt, ist eine feste Position mehr wert
    // als eine gesparte Zeile.
    row(
      "Kundenart",
      gewerbe
        ? `<strong style="color:${GOLD}">Geschäftskunde</strong>`
        : "Privatkunde",
    ),
    row("Name", esc(lead.name)),
    row(
      "Telefon",
      `<a href="tel:${esc(lead.phone.replace(/[^\d+]/g, ""))}"
          style="color:${NAVY};font-weight:700;text-decoration:underline">${esc(lead.phone)}</a>`,
    ),
    lead.email
      ? row(
          "E-Mail",
          `<a href="mailto:${esc(lead.email)}" style="color:${NAVY}">${esc(lead.email)}</a>`,
        )
      : "",
    serviceName ? row("Leistung", esc(serviceName)) : "",
    // Einsatzort als Kartenlink: Arian schaut sich vor dem Rückruf meist an,
    // wo das Objekt liegt — das entscheidet über Anfahrt und Terminplanung.
    // Bewusst "Einsatzort", nicht "Adresse": Es ist oft nicht die Anschrift
    // des Anfragenden, sondern die Wohnung eines Angehörigen.
    lead.strasse || lead.ort
      ? row(
          "Einsatzort",
          `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            [lead.strasse, `${lead.plz ?? ""} ${lead.ort ?? ""}`.trim()]
              .filter(Boolean)
              .join(", "),
          )}" style="color:${NAVY};text-decoration:underline">${esc(
            [lead.strasse, `${lead.plz ?? ""} ${lead.ort ?? ""}`.trim()]
              .filter(Boolean)
              .join(", "),
          )}</a>`,
        )
      : "",
    // Bei Geschäftskunden gab es keinen Rechner, sondern eine Bedarfsabfrage.
    lead.konfigurator
      ? row(gewerbe ? "Bedarf" : "Aus dem Konfigurator", nl2br(lead.konfigurator))
      : "",
    lead.message ? row("Nachricht", nl2br(lead.message)) : "",
    lead.source === "whatsapp"
      ? row(
          "Hinweis",
          "Der Kunde hat zusätzlich WhatsApp geöffnet. Falls dort keine " +
            "Nachricht ankam, hat er sie nicht abgeschickt — die Angaben hier " +
            "sind trotzdem vollständig.",
        )
      : "",
  ].join("");

  // api.whatsapp.com statt wa.me — wa.me zerstoert beim Weiterleiten
  // Sonderzeichen und Emojis (siehe whatsappHref in lib/business.ts).
  const waNumber = lead.phone.replace(/[^\d]/g, "").replace(/^0/, "49");
  const waHref =
    `https://api.whatsapp.com/send?phone=${waNumber}&text=` +
    encodeURIComponent(
      `Hallo ${lead.name}, hier ist ${business.owner} von ${business.shortName}. ` +
        "Sie haben eine Anfrage über unsere Website geschickt.",
    );

  const inner = `
    <tr><td style="padding:30px 32px 8px">
      <p style="margin:0;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.16em;
                text-transform:uppercase;color:${GOLD}">${
                  gewerbe ? "Neue Geschäftskunden-Anfrage" : "Neue Anfrage"
                }${lead.id ? ` · Nr. ${lead.id}` : ""}</p>
      <h1 style="margin:10px 0 0;font:800 24px/1.25 Arial,sans-serif;color:${NAVY}">
        ${esc(lead.name)} wartet auf Ihren Anruf
      </h1>
    </td></tr>
    <tr><td style="padding:18px 32px 6px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </td></tr>
    <tr><td style="padding:24px 32px 30px">
      <a href="tel:${esc(lead.phone.replace(/[^\d+]/g, ""))}"
         style="display:inline-block;background:${NAVY};color:#fff;text-decoration:none;
                font:700 14px/1 Arial,sans-serif;padding:14px 22px;margin:0 8px 8px 0">
        Jetzt anrufen
      </a>
      <a href="${waHref}"
         style="display:inline-block;background:${GOLD};color:${NAVY};text-decoration:none;
                font:700 14px/1 Arial,sans-serif;padding:14px 22px;margin:0 8px 8px 0">
        Per WhatsApp antworten
      </a>
    </td></tr>`;

  return shell(
    `Neue Anfrage von ${lead.name}`,
    inner,
    // Vorschauzeile in der Inbox — die Kundenart nach vorn, aus demselben
    // Grund wie im Betreff.
    `${gewerbe ? "Geschäftskunde · " : ""}${lead.name} · ${lead.phone}` +
      `${serviceName ? ` · ${serviceName}` : ""}`,
  );
}

/* ------------------------------------------------------ Mail an den Kunden */

/* Zwei Fassungen, kein gemeinsamer Text mit Platzhaltern.

   Die Privatfassung verspricht "die Besichtigung vor Ort" und ein
   "verbindliches Festpreisangebot". Bei einer Hausverwaltung mit acht
   Objekten trifft beides nicht: Es gibt nicht den einen Termin morgen, und
   der Preis steht je Objekt und Monat. Ein Versprechen, das nicht gehalten
   werden kann, ist schlimmer als keins — deshalb eigene Texte statt einer
   Fassung, die für beide Seiten halb passt. Rahmen, Logo und Fußzeile teilen
   sich beide über shell(). */

function customerHtml(lead: LeadMail): string {
  if (lead.kundenart === "geschaeft") return customerHtmlGewerbe(lead);

  const serviceName = lead.service ? getService(lead.service)?.name : undefined;

  const inner = `
    <tr><td style="padding:30px 32px 8px">
      <p style="margin:0;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.16em;
                text-transform:uppercase;color:${GOLD}">Ihre Anfrage ist angekommen</p>
      <h1 style="margin:10px 0 0;font:800 24px/1.25 Arial,sans-serif;color:${NAVY}">
        Vielen Dank, ${esc(lead.name.split(" ")[0])}.
      </h1>
      <p style="margin:16px 0 0;font:400 15px/1.7 Arial,sans-serif;color:#4a5568">
        Wir haben Ihre Anfrage${serviceName ? ` zum Thema <strong style="color:${NAVY}">${esc(serviceName)}</strong>` : ""}
        erhalten und melden uns in der Regel noch am selben Werktag bei Ihnen.
        Die Besichtigung vor Ort ist kostenlos und unverbindlich.
      </p>
    </td></tr>

    ${
      lead.konfigurator
        ? `<tr><td style="padding:22px 32px 0">
             <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                    style="background:${SHELL};border-left:3px solid ${GOLD}">
               <tr><td style="padding:16px 18px">
                 <p style="margin:0 0 6px;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.14em;
                           text-transform:uppercase;color:#4a5568">Ihre Angaben</p>
                 <p style="margin:0;font:400 14px/1.7 Arial,sans-serif;color:${NAVY}">
                   ${nl2br(lead.konfigurator)}
                 </p>
               </td></tr>
             </table>
           </td></tr>`
        : ""
    }

    <tr><td style="padding:24px 32px 0">
      <p style="margin:0 0 10px;font:700 13px/1.4 Arial,sans-serif;color:${NAVY}">Wie es weitergeht</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${["Wir rufen Sie an und klären die Details.", "Wir schauen uns das Objekt an — kostenlos.", "Sie erhalten ein verbindliches Festpreisangebot."]
          .map(
            (step, i) => `
          <tr><td style="padding:6px 0;font:400 14px/1.6 Arial,sans-serif;color:#4a5568">
            <span style="display:inline-block;width:22px;font-weight:700;color:${GOLD}">${i + 1}.</span>
            ${esc(step)}
          </td></tr>`,
          )
          .join("")}
      </table>
    </td></tr>

    <tr><td style="padding:22px 32px 30px">
      <p style="margin:0;font:400 13px/1.7 Arial,sans-serif;color:#7a8496">
        Der im Konfigurator gezeigte Betrag ist eine unverbindliche Schätzung und
        kein Angebot. Ein Vertrag entsteht erst, wenn Sie ein schriftliches
        Angebot von uns annehmen. Wenn es eilt, erreichen Sie uns direkt unter
        <a href="${business.phone.href}" style="color:${NAVY};font-weight:700">${esc(business.phone.display)}</a>.
      </p>
    </td></tr>`;

  return shell(
    `Ihre Anfrage bei ${business.shortName}`,
    inner,
    "Wir haben Ihre Anfrage erhalten und melden uns in der Regel am selben Werktag.",
  );
}

function customerHtmlGewerbe(lead: LeadMail): string {
  const serviceName = lead.service ? getService(lead.service)?.name : undefined;

  const inner = `
    <tr><td style="padding:30px 32px 8px">
      <p style="margin:0;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.16em;
                text-transform:uppercase;color:${GOLD}">Ihre Anfrage ist angekommen</p>
      <h1 style="margin:10px 0 0;font:800 24px/1.25 Arial,sans-serif;color:${NAVY}">
        Vielen Dank, ${esc(lead.name.split(" ")[0])}.
      </h1>
      <p style="margin:16px 0 0;font:400 15px/1.7 Arial,sans-serif;color:#4a5568">
        Wir haben Ihre Anfrage${serviceName ? ` zum Thema <strong style="color:${NAVY}">${esc(serviceName)}</strong>` : ""}
        erhalten und melden uns innerhalb eines Werktags bei Ihnen.
        Die Begehung Ihrer Objekte ist kostenlos und unverbindlich.
      </p>
    </td></tr>

    ${
      lead.konfigurator
        ? `<tr><td style="padding:22px 32px 0">
             <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                    style="background:${SHELL};border-left:3px solid ${GOLD}">
               <tr><td style="padding:16px 18px">
                 <p style="margin:0 0 6px;font:700 11px/1.4 Arial,sans-serif;letter-spacing:.14em;
                           text-transform:uppercase;color:#4a5568">Ihr Bedarf</p>
                 <p style="margin:0;font:400 14px/1.7 Arial,sans-serif;color:${NAVY}">
                   ${nl2br(lead.konfigurator)}
                 </p>
               </td></tr>
             </table>
           </td></tr>`
        : ""
    }

    <tr><td style="padding:24px 32px 0">
      <p style="margin:0 0 10px;font:700 13px/1.4 Arial,sans-serif;color:${NAVY}">Wie es weitergeht</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${[
          "Wir rufen Sie an und klären den Umfang.",
          "Wir begehen die Objekte gemeinsam — kostenlos.",
          "Sie erhalten ein schriftliches Angebot mit Leistungsverzeichnis.",
        ]
          .map(
            (step, i) => `
          <tr><td style="padding:6px 0;font:400 14px/1.6 Arial,sans-serif;color:#4a5568">
            <span style="display:inline-block;width:22px;font-weight:700;color:${GOLD}">${i + 1}.</span>
            ${esc(step)}
          </td></tr>`,
          )
          .join("")}
      </table>
    </td></tr>

    <tr><td style="padding:22px 32px 30px">
      <p style="margin:0;font:400 13px/1.7 Arial,sans-serif;color:#7a8496">
        Das Angebot weist den Preis je Objekt und Monat aus und ist monatlich
        kündbar. Ein Vertrag entsteht erst, wenn Sie es annehmen. Wenn es eilt,
        erreichen Sie uns direkt unter
        <a href="${business.phone.href}" style="color:${NAVY};font-weight:700">${esc(business.phone.display)}</a>.
      </p>
    </td></tr>`;

  return shell(
    `Ihre Anfrage bei ${business.shortName}`,
    inner,
    "Wir haben Ihre Anfrage erhalten und melden uns innerhalb eines Werktags.",
  );
}

/* ------------------------------------------------------------------ Versand */

export type MailOutcome = { internal: boolean; customer: boolean; demo: boolean };

export async function sendLeadMails(lead: LeadMail): Promise<MailOutcome> {
  const cfg = readSmtp();

  if (!cfg) {
    console.log("[ARIZU Mail-Demo-Modus] Lead:", JSON.stringify(lead));
    return { internal: false, customer: false, demo: true };
  }

  const t = transport(cfg);
  const outcome: MailOutcome = { internal: false, customer: false, demo: false };

  // Reihenfolge mit Absicht: Die Betriebsmail ist die geschäftskritische.
  // Scheitert die Kundenbestätigung, ist der Lead trotzdem angekommen.
  try {
    await t.sendMail({
      from: cfg.from,
      to: process.env.LEAD_TO || business.email,
      replyTo: lead.email || undefined,
      // Kundenart ganz vorn: Arian liest Betreffzeilen auf dem Sperrbildschirm,
      // und dort entscheiden die ersten rund 20 Zeichen, ob er sofort öffnet.
      // Genau das war sein "die kann ich sofort kontaktieren".
      subject:
        `${lead.kundenart === "geschaeft" ? "Geschäftskunde" : "Neue Anfrage"}: ` +
        `${lead.name}${lead.service ? ` — ${getService(lead.service)?.name}` : ""}`,
      html: internalHtml(lead),
    });
    outcome.internal = true;
  } catch (err) {
    console.error("[ARIZU] Betriebsmail fehlgeschlagen:", err, lead);
  }

  if (lead.email) {
    try {
      await t.sendMail({
        from: cfg.from,
        to: lead.email,
        subject: `Ihre Anfrage bei ${business.name}`,
        html: customerHtml(lead),
      });
      outcome.customer = true;
    } catch (err) {
      console.error("[ARIZU] Kundenbestätigung fehlgeschlagen:", err);
    }
  }

  return outcome;
}
