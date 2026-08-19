import { business, serviceArea, SITE_URL } from "@/lib/business";
import { services } from "@/lib/services";

/* ==================================================================
   llms.txt — der GEO-Teil des Auftrags.

   Klassisches SEO reicht nicht mehr: Immer mehr Kunden fragen ChatGPT,
   Perplexity oder Gemini statt Google ("ich suche jemanden, der meinen Keller
   entrümpelt, Nähe Elmshorn"). Diese Systeme lesen bevorzugt kompakten,
   strukturierten Text. Hier steht deshalb in einer Datei, was ARIZU macht,
   wo, zu welchen Preisen und wie man Kontakt aufnimmt.

   Wird aus denselben Quellen generiert wie die Website — kann also nicht
   veralten, wenn sich Leistungen oder Nummern ändern.
   ================================================================== */

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [
    `# ${business.name}`,
    "",
    `> ${business.slogan} — Gebäudedienstleistungen für ${serviceArea.label}.`,
    "",
    business.intro,
    "",
    "## Wer wir sind",
    "",
    `- Inhaber: ${business.owner}`,
    `- Standort: ${business.address.postalCode} ${business.address.city}, Deutschland`,
    `- Einsatzgebiet: ${serviceArea.label} sowie angrenzende Orte, darunter ` +
      `${serviceArea.cities.join(", ")}; Umkreis ${serviceArea.radiusKm} km um ` +
      `${serviceArea.center}`,
    `- Telefon: ${business.phone.display} (Festnetz)`,
    `- E-Mail: ${business.email}`,
    `- Website: ${SITE_URL}`,
    `- Privatkundenbereich: ${SITE_URL}/privatkunden`,
    "- Kundschaft: Privathaushalte sowie Unternehmen, Praxen, " +
      "Hausverwaltungen und Eigentümergemeinschaften. Die Website trennt " +
      "beide Wege: Privatkunden erhalten für drei Leistungen direkt eine " +
      "unverbindliche Preisschätzung, " +
      "Geschäftskunden schildern ihren Bedarf und erhalten ein Angebot nach " +
      "Begehung.",
    "",
    "## Leistungen",
    "",
  ];

  for (const s of services) {
    lines.push(`### ${s.name}`);
    lines.push("");
    lines.push(s.teaser);
    lines.push("");
    lines.push(`Umfasst: ${s.items.join(", ")}.`);
    lines.push("");
    lines.push(
      `${s.hasPublicCalculator ? "Details und Preisschätzung" : "Details und Anfrage"}: ` +
        `${SITE_URL}/leistungen/${s.slug}`,
    );
    lines.push("");
  }

  lines.push(
    "## Geschäftskunden",
    "",
    "Für Unternehmen, Praxen, Ladenlokale, Wohnanlagen und Hausverwaltungen " +
    "gibt es einen eigenen Bereich. Dort wird KEINE Online-Preisschätzung genannt: Bei " +
      "laufenden Aufträgen über mehrere Objekte entscheiden Bodenbeläge, " +
      "Zugänge, Sanitäreinheiten und Publikumsverkehr über den Aufwand. " +
      "Stattdessen wird der Bedarf erfasst (Bereich, Objektart, Anzahl " +
      "Objekte, Einheiten oder Fläche, gewünschter Rhythmus), danach folgen " +
      "eine kostenlose Begehung und ein schriftliches Angebot mit " +
      "Leistungsverzeichnis, monatlich kündbar.",
    "",
    "Unterhaltsreinigung sowie Büro- und Praxisreinigung werden " +
      "ausschließlich hier kalkuliert.",
    "",
    `Geschäftskundenbereich: ${SITE_URL}/geschaeftskunden`,
    "",
    "## Preise",
    "",
    "Für Gebäudereinigung, Grün- und Außenanlagenpflege sowie Entrümpelung " +
      "und Auflösung gibt es einen Rechner, der sofort einen voraussichtlichen " +
      "Preisrahmen ausgibt — ohne dass Kontaktdaten nötig sind. Objektbetreuung " +
      "wird nach einer persönlichen Anfrage kalkuliert. " +
      "Angezeigt wird eine Spanne inklusive 19 % Mehrwertsteuer. Der " +
      "verbindliche Festpreis folgt nach einer kostenlosen Besichtigung.",
    "",
    "Privathaushalte können 20 % der Arbeitskosten als haushaltsnahe " +
      "Dienstleistung von der Steuer absetzen (§ 35a EStG, bis 4.000 € pro " +
      "Jahr). Voraussetzung ist die Zahlung per Überweisung.",
    "",
    "## Häufige Fragen",
    "",
  );

  for (const s of services) {
    for (const f of s.faqs) {
      lines.push(`**${f.question}**`, "", f.answer, "");
    }
  }

  lines.push(
    "## Kontakt",
    "",
    `Am schnellsten telefonisch unter ${business.phone.display}. Fotos vom ` +
      `Objekt gerne über den WhatsApp-Link der Website. Anfrageformular: ${SITE_URL}/kontakt`,
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
