import { whatsappHref } from "./business";

/* ==================================================================
   Der Text, der die Anfrage beschreibt — an genau einer Stelle formuliert.

   Er läuft in die WhatsApp-Nachricht, in die Betriebsmail, in die
   Kundenbestätigung und in die Lead-Inbox. Würde jede Stelle ihn selbst
   zusammenbauen, würden die Fassungen mit der Zeit auseinanderlaufen.
   ================================================================== */

export type AnfrageDaten = {
  name: string;
  /* Adresse des EINSATZORTES, nicht zwingend die Wohnadresse des Kunden.
     Bei Entrümpelungen ist es häufig die Wohnung eines Angehörigen, bei
     Objektbetreuung das verwaltete Haus. Deshalb steht sie in der Nachricht
     auch beim Auftrag und nicht im Kontaktblock. */
  strasse: string;
  plz: string;
  ort: string;
  phone: string;
  email?: string;
  message?: string;
  /** Leistungsname, z. B. "Entrümpelung". */
  leistung?: string;
  /** Emoji der Leistung — in einer Chat-App die einzige Bildsprache. */
  emoji?: string;
  /** Auswahl aus dem Konfigurator als "Feld: Wert · Feld: Wert". */
  auswahl?: string;
  /** Richtpreis ohne Einheit, z. B. "ca. 1.370 € – 1.690 €". */
  richtpreis?: string;
  /** Abrechnungseinheit, z. B. "einmalig" oder "pro Monat". */
  einheit?: string;
  /** Einmalposten, falls vorhanden. */
  einmalig?: string;
};

/**
 * Einsatzort in deutscher Lesereihenfolge: Straße zuerst, dann PLZ und Ort.
 * "Römerstraße 23, 51674 Wiehl"
 */
export function adresseEinzeilig(d: {
  strasse: string;
  plz: string;
  ort: string;
}): string {
  return `${d.strasse}, ${d.plz} ${d.ort}`;
}

/**
 * Nachricht für WhatsApp.
 *
 * Bewusst in der Ich-Form aus Sicht des Kunden geschrieben — sie erscheint in
 * seinem Chatfenster und er schickt sie ab. Eine Nachricht in der Wir-Form
 * würde dort merkwürdig wirken, so als hätte der Betrieb sie verfasst.
 *
 * Aufbau: erst die Leistung mit den Eckdaten, dann der Preis, dann die
 * Kontaktdaten. Arian liest die Nachricht auf dem Handy und braucht zuerst
 * die Frage "worum geht es", danach "was kostet es" und zum Schluss "wen
 * rufe ich an" — in dieser Reihenfolge greift er auch zum Telefon.
 *
 * `*Sternchen*` ist WhatsApps Auszeichnung für fett. Sparsam eingesetzt:
 * Leistung, Preis und die Überschrift der Kontaktdaten. Wäre alles fett,
 * wäre nichts hervorgehoben.
 */
export function whatsappText(d: AnfrageDaten): string {
  const block: string[] = ["Hallo! Ich möchte folgende Leistung anfragen:", ""];

  if (d.leistung) {
    block.push(`${d.emoji ?? "🔧"} *${d.leistung}*`);
  }

  // Die Auswahl kommt als "Feld: Wert · Feld: Wert" — im Chat liest sich das
  // als Liste deutlich besser als in einer langen Zeile.
  if (d.auswahl) {
    for (const teil of d.auswahl.split(" · ")) {
      block.push(`• ${teil}`);
    }
  }

  // Der Einsatzort gehört zum Auftrag, nicht zu den Kontaktdaten — sonst
  // liest Arian ihn als Wohnadresse des Anfragenden. Das ist er oft nicht.
  block.push("", "📍 *Einsatzort*", adresseEinzeilig(d));

  if (d.richtpreis) {
    block.push(
      "",
      `💶 Ihr Rechner nennt *${d.richtpreis}*${d.einheit ? ` ${d.einheit}` : ""}, inkl. MwSt.`,
    );
  }
  if (d.einmalig) block.push(`➕ ${d.einmalig}`);

  if (d.message) block.push("", `📝 ${d.message}`);

  block.push("", "*Meine Kontaktdaten*", `👤 ${d.name}`, `📞 ${d.phone}`);
  if (d.email) block.push(`✉️ ${d.email}`);

  block.push("", "Bitte melden Sie sich für einen Termin vor Ort. Danke!");

  return block.join("\n");
}

/** Fertiger WhatsApp-Link mit vorbefüllter Nachricht. */
export function whatsappLink(d: AnfrageDaten): string {
  return whatsappHref(whatsappText(d));
}
