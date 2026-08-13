import { business } from "./business";

/* ==================================================================
   Der Text, der die Anfrage beschreibt — an genau einer Stelle formuliert.

   Er läuft in die WhatsApp-Nachricht, in die Betriebsmail, in die
   Kundenbestätigung und in die Lead-Inbox. Würde jede Stelle ihn selbst
   zusammenbauen, würden die Fassungen mit der Zeit auseinanderlaufen.
   ================================================================== */

export type AnfrageDaten = {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  phone: string;
  message?: string;
  /** Leistungsname, z. B. "Entrümpelung". */
  leistung?: string;
  /** Auswahl aus dem Konfigurator, bereits als Fließtext. */
  auswahl?: string;
  /** Richtpreis als fertige Zeile, z. B. "ca. 1.720 € – 2.120 € einmalig". */
  richtpreis?: string;
  /** Einmalposten, falls vorhanden. */
  einmalig?: string;
};

/** Adresse in einer Zeile: "51674 Wedel, Römerstraße 23". */
export function adresseEinzeilig(d: {
  strasse: string;
  plz: string;
  ort: string;
}): string {
  return `${d.plz} ${d.ort}, ${d.strasse}`;
}

/**
 * Nachricht für WhatsApp.
 *
 * Bewusst in der Ich-Form aus Sicht des Kunden geschrieben — sie erscheint in
 * seinem Chatfenster und er schickt sie ab. Eine Nachricht in der Wir-Form
 * würde dort merkwürdig wirken, so als hätte der Betrieb sie verfasst.
 */
export function whatsappText(d: AnfrageDaten): string {
  const zeilen: string[] = [
    `Hallo, ich bin ${d.name}.`,
    `Ich wohne in ${adresseEinzeilig(d)} und möchte Folgendes anfragen:`,
    "",
  ];

  if (d.leistung) zeilen.push(`Leistung: ${d.leistung}`);
  if (d.auswahl) zeilen.push(d.auswahl);
  if (d.richtpreis) zeilen.push(`Ihr Rechner nennt dafür ${d.richtpreis}.`);
  if (d.einmalig) zeilen.push(d.einmalig);
  if (d.message) zeilen.push("", d.message);

  zeilen.push(
    "",
    "Bitte melden Sie sich für einen Termin vor Ort.",
    `Erreichbar bin ich unter ${d.phone}.`,
  );

  return zeilen.join("\n");
}

/** Fertiger wa.me-Link mit vorbefüllter Nachricht. */
export function whatsappLink(d: AnfrageDaten): string {
  return `${business.whatsapp.href}?text=${encodeURIComponent(whatsappText(d))}`;
}
