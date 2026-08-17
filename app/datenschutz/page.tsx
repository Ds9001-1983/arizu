import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";
import { business } from "@/lib/business";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: `Wie ${business.name} personenbezogene Daten verarbeitet.`,
  alternates: { canonical: "/datenschutz" },
};

/* ==================================================================
   Datenschutzerklärung.

   Kein <Fehlt> und kein Warnbanner mehr: Der Text beschreibt vollständig,
   was tatsächlich passiert. Die beiden Punkte, die vorher hier standen —
   Auftragsverarbeitungsverträge und anwaltliche Prüfung —, gehören nicht auf
   eine öffentliche Seite. Sie sind Pflichten des Verantwortlichen, keine
   Angaben gegenüber dem Besucher, und stehen jetzt in der Liste offener
   Punkte im README.

   Die Angaben zu Cookies und Drittanbietern sind am 14.08.2026 an der
   Live-Seite gemessen worden, nicht angenommen: kein einziger Fremdhost,
   kein Cookie, leerer localStorage und sessionStorage.
   ================================================================== */

export default function DatenschutzPage() {
  return (
    <LegalLayout title="Datenschutzerklärung" updated="August 2026">
      <h2>1. Verantwortlicher</h2>
      <p>
        {business.legalName}
        <br />
        {business.address.street}
        <br />
        {business.address.postalCode} {business.address.city}
        <br />
        E-Mail: <a href={`mailto:${business.email}`}>{business.email}</a>
        <br />
        Telefon: <a href={business.phone.href}>{business.phone.display}</a>
      </p>
      <p>
        Ein Datenschutzbeauftragter ist nicht bestellt. Die Voraussetzungen des
        § 38 BDSG liegen nicht vor, da in unserem Betrieb nicht mindestens
        zwanzig Personen ständig mit der automatisierten Verarbeitung
        personenbezogener Daten beschäftigt sind.
      </p>

      <h2>2. Ihre Rechte</h2>
      <p>
        Sie haben jederzeit das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung
        (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
        Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Eine erteilte
        Einwilligung können Sie jederzeit mit Wirkung für die Zukunft
        widerrufen; die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung
        bleibt davon unberührt. Eine formlose Nachricht an die oben genannte
        Adresse genügt.
      </p>
      <p>
        Außerdem können Sie sich bei einer Aufsichtsbehörde beschweren
        (Art. 77 DSGVO). Für uns zuständig ist das Unabhängige Landeszentrum
        für Datenschutz Schleswig-Holstein, Holstenstraße 98, 24103 Kiel.
      </p>
      <p>
        Eine automatisierte Entscheidungsfindung einschließlich Profiling nach
        Art. 22 DSGVO findet nicht statt. Der Preisrechner erzeugt lediglich
        eine unverbindliche Schätzung und trifft keine Entscheidung über Sie.
      </p>

      <h2>3. Aufruf dieser Website (Server-Logs)</h2>
      <p>
        Beim Besuch werden technisch notwendige Daten verarbeitet: IP-Adresse,
        Datum und Uhrzeit, aufgerufene Seite, übertragene Datenmenge,
        Browsertyp und Betriebssystem. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
        DSGVO — unser berechtigtes Interesse am sicheren, stabilen Betrieb.
        Diese Daten werden nicht mit anderen Datenquellen zusammengeführt und
        nicht zur Identifizierung einzelner Personen ausgewertet.
      </p>
      <p>
        Gehostet wird die Seite bei der Vercel Inc., 440 N Barranca Ave #4133,
        Covina, CA 91723, USA. Die Übermittlung in die USA stützt sich auf die
        Standardvertragsklauseln der Europäischen Kommission, die Bestandteil
        der Vertragsbedingungen von Vercel sind.
      </p>
      <p>
        Die Verbindung zu dieser Website ist durchgehend mit TLS verschlüsselt.
        Sie erkennen das am Schlosssymbol in der Adresszeile Ihres Browsers.
      </p>

      <h2>4. Preisrechner</h2>
      <p>
        Der Preisrechner läuft vollständig in Ihrem Browser. Ihre Eingaben
        werden dabei <strong>nicht</strong> an uns übertragen und nicht
        gespeichert. Erst wenn Sie auf „Unverbindlich anfragen“ klicken und das
        Formular absenden, werden die Angaben zusammen mit Ihren Kontaktdaten
        übermittelt.
      </p>

      <h2>5. Anfrageformular</h2>
      <p>
        Wir verarbeiten die von Ihnen eingegebenen Daten, um Ihre Anfrage zu
        bearbeiten. Als Privatkunde sind das Name, Telefonnummer, optional
        E-Mail-Adresse, die Anschrift des Einsatzortes, Ihre Nachricht sowie
        die Angaben aus dem Preisrechner. Fragen Sie über den
        Geschäftskundenbereich an, kommen die dort erhobenen Angaben hinzu:
        Unternehmen, Ansprechpartner und Funktion, Art und Anzahl der Objekte,
        Einheiten oder Fläche, gewünschter Rhythmus und Wunschtermin. Wir
        vermerken außerdem, ob eine Anfrage aus dem Privat- oder aus dem
        Geschäftskundenbereich stammt.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung
        vorvertraglicher Maßnahmen) sowie Ihre Einwilligung nach Art. 6 Abs. 1
        lit. a DSGVO. Die Angabe der Pflichtfelder ist erforderlich, damit wir
        Ihre Anfrage bearbeiten und Ihnen antworten können; ohne sie können wir
        kein Angebot erstellen. Eine gesetzliche oder vertragliche Pflicht zur
        Bereitstellung besteht nicht.
      </p>
      <p>
        Die Anfrage wird per E-Mail an uns übermittelt und zusätzlich in einer
        Datenbank gespeichert, damit sie nicht verloren geht und wir den Stand
        der Bearbeitung nachvollziehen können. Die Datenbank wird von Neon
        betrieben und über den Marktplatz unseres Hosting-Anbieters Vercel
        bezogen. Die Daten liegen ausschließlich in der Region eu-central-1
        (Frankfurt am Main) und damit innerhalb der Europäischen Union. Wenn
        Sie eine E-Mail-Adresse angeben, erhalten Sie eine Bestätigungsmail.
      </p>
      <p>
        Im internen Bereich kann zu einer Anfrage eine abweichende
        Rechnungsanschrift ergänzt werden, außerdem der Bearbeitungsstand und
        eine interne Notiz. Diese Angaben stammen aus dem Kontakt mit Ihnen,
        etwa aus einem Telefonat oder dem Termin vor Ort.
      </p>

      <h2>6. Speicherdauer</h2>
      <p>
        Führt Ihre Anfrage nicht zu einem Auftrag, löschen wir sie spätestens{" "}
        <strong>24 Monate nach dem letzten Kontakt</strong>. Die Frist ist so
        bemessen, weil Interessenten in unserem Gewerbe häufig saisonal
        zurückkommen — etwa zur nächsten Gartensaison oder zum Winterdienst —
        und wir dann an das Vorgespräch anknüpfen können.
      </p>
      <p>
        Kommt ein Auftrag zustande, gelten die gesetzlichen
        Aufbewahrungsfristen: sechs Jahre für Handelsbriefe (§ 257 HGB) und
        zehn Jahre für Buchungsbelege und Rechnungen (§ 147 AO). Während dieser
        Zeit sind die Daten in der Verarbeitung eingeschränkt und werden
        ausschließlich zur Erfüllung dieser Pflichten vorgehalten.
      </p>
      <p>
        Sie können jederzeit die Löschung verlangen. Wir kommen dem nach,
        soweit keine der genannten Aufbewahrungspflichten entgegensteht.
      </p>

      <h2>7. E-Mail-Versand</h2>
      <p>
        Für den Versand von Benachrichtigungen und Bestätigungen nutzen wir den
        Mailserver der Hetzner Online GmbH, Industriestraße 25, 91710
        Gunzenhausen. Die Server stehen in Deutschland. E-Mails werden
        transportverschlüsselt übertragen, sofern der empfangende Server das
        unterstützt; eine Ende-zu-Ende-Verschlüsselung findet nicht statt.
      </p>

      <h2>8. Cookies und Tracking</h2>
      <p>
        Diese Website setzt beim Besuch <strong>keine Cookies</strong> und legt
        weder im lokalen Speicher noch im Sitzungsspeicher Ihres Browsers etwas
        ab. Wenn Sie auf der Startseite „Privatkunde“ oder „Geschäftskunde“
        auswählen, wird ausschließlich der jeweilige Gesamtzähler um eins
        erhöht. Wir speichern dabei kein einzelnes Ereignis, keinen Zeitpunkt,
        keine IP-Adresse, keine Gerätekennung und kein Nutzerprofil. Die beiden
        anonymen Summen zeigen uns lediglich, welcher Seitenweg häufiger gewählt
        wird. Ein externer Analysedienst ist nicht beteiligt.
      </p>
      <p>
        Ein Cookie-Banner ist nicht erforderlich, weil dabei keine Information
        auf Ihrem Endgerät gespeichert oder daraus ausgelesen wird (§ 25 TDDDG).
        Eine Wiedererkennung einzelner Besucher findet nicht statt.
      </p>
      <p>
        Ein einziges Cookie wird gesetzt, wenn sich ein Mitarbeiter im internen
        Bereich anmeldet. Es ist für den Anmeldevorgang unbedingt erforderlich
        (§ 25 Abs. 2 Nr. 2 TDDDG), enthält nur ein signiertes
        Sitzungsmerkmal und keine personenbezogenen Daten. Für Besucher der
        öffentlichen Seiten entsteht es nicht.
      </p>

      <h2>9. Keine Einbindung externer Dienste</h2>
      <p>
        Beim Aufruf dieser Website wird <strong>kein einziger fremder Server
        kontaktiert</strong>. Schriften, Bilder und das Video im Seitenkopf
        werden von unserem eigenen Server geladen. Es besteht insbesondere
        keine Verbindung zu Google-Servern, es wird also auch keine IP-Adresse
        an Google übermittelt.
      </p>
      <p>
        Wir binden weder eine Google-Maps-Karte noch Social-Media-Plugins ein.
        Verweise auf externe Dienste sind einfache Links — erst durch Ihren
        Klick entsteht eine Verbindung zum jeweiligen Anbieter.
      </p>

      <h2>10. WhatsApp</h2>
      <p>
        Wenn Sie uns über den WhatsApp-Link kontaktieren, verlassen Sie diese
        Website. Die WhatsApp Ireland Limited verarbeitet Ihre Daten dann nach
        eigenen Bestimmungen, worauf wir keinen Einfluss haben. Die Nachricht
        wird lediglich in Ihrer App vorbereitet; abgeschickt wird sie erst durch
        Sie. Für sensible Angaben nutzen Sie bitte das Formular, das Telefon
        oder die E-Mail.
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
