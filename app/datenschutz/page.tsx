import type { Metadata } from "next";
import { Fehlt, LegalLayout } from "@/components/site/legal-layout";
import { business } from "@/lib/business";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: `Wie ${business.name} personenbezogene Daten verarbeitet.`,
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <LegalLayout
      title="Datenschutzerklärung"
      updated="August 2026"
      todo={
        "Anschrift des Verantwortlichen ergänzen. Außerdem prüfen, ob die " +
        "genannten Dienstleister (Vercel, Neon, Mailserver) mit dem " +
        "tatsächlichen Setup übereinstimmen, und die " +
        "Auftragsverarbeitungsverträge abschließen. Diesen Text " +
        "abschließend juristisch prüfen lassen."
      }
    >
      <h2>1. Verantwortlicher</h2>
      <p>
        {business.legalName}
        <br />
        <Fehlt>Straße und Hausnummer</Fehlt>
        <br />
        {business.address.postalCode} {business.address.city}
        <br />
        E-Mail: <a href={`mailto:${business.email}`}>{business.email}</a>
        <br />
        Telefon: <a href={business.phone.href}>{business.phone.display}</a>
      </p>

      <h2>2. Ihre Rechte</h2>
      <p>
        Sie haben jederzeit das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung
        (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
        Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Eine erteilte
        Einwilligung können Sie jederzeit widerrufen. Außerdem können Sie sich
        bei einer Aufsichtsbehörde beschweren; für Schleswig-Holstein ist das
        das Unabhängige Landeszentrum für Datenschutz (ULD).
      </p>

      <h2>3. Aufruf dieser Website (Server-Logs)</h2>
      <p>
        Beim Besuch werden technisch notwendige Daten verarbeitet: IP-Adresse,
        Datum und Uhrzeit, aufgerufene Seite, übertragene Datenmenge,
        Browsertyp und Betriebssystem. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
        DSGVO — unser berechtigtes Interesse am sicheren, stabilen Betrieb.
      </p>
      <p>
        Gehostet wird die Seite bei der Vercel Inc., 440 N Barranca Ave #4133,
        Covina, CA 91723, USA. Die Übermittlung in die USA erfolgt auf Basis
        von Standardvertragsklauseln und eines Auftragsverarbeitungsvertrags.
      </p>

      <h2>4. Preisrechner</h2>
      <p>
        Der Preisrechner läuft vollständig in Ihrem Browser. Ihre Eingaben
        werden dabei <strong>nicht</strong> an uns übertragen. Erst wenn Sie auf
        „Unverbindlich anfragen“ klicken und das Formular absenden, werden die
        Angaben zusammen mit Ihren Kontaktdaten übermittelt.
      </p>

      <h2>5. Anfrageformular</h2>
      <p>
        Wir verarbeiten die von Ihnen eingegebenen Daten (Name, Telefonnummer,
        optional E-Mail-Adresse, Objektangaben, Nachricht sowie die Angaben aus
        dem Preisrechner), um Ihre Anfrage zu bearbeiten. Rechtsgrundlage ist
        Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) sowie Ihre Einwilligung
        nach Art. 6 Abs. 1 lit. a DSGVO.
      </p>
      <p>
        Die Anfrage wird per E-Mail an uns übermittelt und in einer Datenbank
        gespeichert, damit sie nicht verloren geht und wir den Stand der
        Bearbeitung nachvollziehen können. Als Datenbankdienstleister nutzen wir{" "}
        <Fehlt>Neon (Region bestätigen) — Auftragsverarbeitungsvertrag prüfen</Fehlt>.
        Wenn Sie eine E-Mail-Adresse angeben, erhalten Sie eine
        Bestätigungsmail.
      </p>
      <p>
        Wir löschen Anfragen, sobald sie für die Bearbeitung nicht mehr
        erforderlich sind, spätestens{" "}
        <Fehlt>Löschfrist festlegen, z. B. 24 Monate nach letztem Kontakt</Fehlt>.
        Handelsrechtliche und steuerliche Aufbewahrungspflichten bleiben
        unberührt.
      </p>

      <h2>6. E-Mail-Versand</h2>
      <p>
        Für den Versand von Benachrichtigungen und Bestätigungen nutzen wir den
        Mailserver unseres Hosting-Anbieters{" "}
        <Fehlt>Anbieter und Anschrift des Mailservers</Fehlt>.
      </p>

      <h2>7. Cookies und Tracking</h2>
      <p>
        Diese Website setzt <strong>keine Analyse-, Werbe- oder
        Tracking-Cookies</strong> ein. Es gibt daher auch kein Cookie-Banner.
        Gesetzt wird ausschließlich ein technisch notwendiges Cookie, wenn sich
        ein Mitarbeiter im internen Bereich anmeldet; es enthält nur ein
        signiertes Sitzungsmerkmal und keine personenbezogenen Daten.
      </p>

      <h2>8. Schriftarten</h2>
      <p>
        Die verwendeten Schriften werden von unserem eigenen Server geladen. Es
        besteht dabei <strong>keine Verbindung zu Google-Servern</strong>, es
        wird also auch keine IP-Adresse an Google übermittelt.
      </p>

      <h2>9. Kartenmaterial und Social Media</h2>
      <p>
        Wir binden keine Google-Maps-Karte und keine Social-Media-Plugins direkt
        ein. Verweise auf externe Dienste sind einfache Links — erst durch Ihren
        Klick entsteht eine Verbindung zum jeweiligen Anbieter.
      </p>

      <h2>10. WhatsApp</h2>
      <p>
        Wenn Sie uns über den WhatsApp-Link kontaktieren, verarbeitet die
        WhatsApp Ireland Limited Ihre Daten nach eigenen Bestimmungen. Wir haben
        darauf keinen Einfluss. Für sensible Angaben nutzen Sie bitte das
        Formular, das Telefon oder die E-Mail.
      </p>

      <h2>11. Bilder auf dieser Website</h2>
      <p>
        Ein Teil der Bilder auf dieser Website wurde mit Hilfe künstlicher
        Intelligenz erzeugt. Diese Bilder sind sichtbar als „KI-generiert“
        gekennzeichnet und zusätzlich in den Metadaten der Bilddatei
        ausgewiesen. Sobald eigene Aufnahmen von Einsätzen vorliegen, ersetzen
        wir sie.
      </p>
    </LegalLayout>
  );
}
