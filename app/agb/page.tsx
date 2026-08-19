import type { Metadata } from "next";
import { Fehlt, LegalLayout } from "@/components/site/legal-layout";
import { business } from "@/lib/business";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: `Allgemeine Geschäftsbedingungen von ${business.name}.`,
  alternates: { canonical: "/agb" },
  // Solange es ein Entwurf ist, hat der Text in keinem Suchindex etwas zu suchen.
  robots: { index: false, follow: true },
};

/* ==================================================================
   ENTWURF. Kein Rechtsrat.

   Zwei Punkte, bei denen Vorlagen aus dem Netz regelmäßig falsch sind und die
   deshalb hier bewusst anders formuliert wurden:

   1. Stornopauschale (§ 8): Im Kundengespräch war von 50 € pauschal die Rede.
      Eine solche Klausel ist in Verbraucher-AGB nur wirksam, wenn der Betrag
      den typischen Schaden nicht übersteigt UND dem Kunden ausdrücklich
      erlaubt bleibt, einen geringeren Schaden nachzuweisen (§ 309 Nr. 5 BGB).
      Fehlt der zweite Halbsatz, ist die ganze Klausel unwirksam — dann gibt
      es gar keinen Anspruch.

   2. Widerrufsrecht (§ 9): Arian schließt Verträge telefonisch und beim Kunden
      zu Hause ab. Das sind Fernabsatz- bzw. außerhalb von Geschäftsräumen
      geschlossene Verträge, also 14 Tage Widerrufsrecht. Soll vor Ablauf der
      Frist gearbeitet werden, braucht es die ausdrückliche Zustimmung des
      Kunden plus dessen Kenntnisnahme, dass er sein Widerrufsrecht bei
      vollständiger Leistung verliert.
   ================================================================== */

export default function AgbPage() {
  return (
    <LegalLayout
      title="Allgemeine Geschäftsbedingungen"
      updated="Entwurf, August 2026"
      todo={
        "Dies ist ein ENTWURF als Diskussionsgrundlage, keine Rechtsberatung. " +
        "Vor der Verwendung anwaltlich prüfen lassen — insbesondere § 8 " +
        "(Stornierung) und § 9 (Widerrufsrecht). Die Seite ist bis dahin auf " +
        "noindex gesetzt. Offene Werte sind rot markiert."
      }
    >
      <h2>§ 1 Geltungsbereich</h2>
      <p>
        Diese Bedingungen gelten für alle Verträge zwischen {business.legalName}{" "}
        (nachfolgend „wir“) und dem Auftraggeber über Leistungen der
        Gebäudereinigung, Grün- und Außenanlagenpflege, Objektbetreuung sowie
        Entrümpelung und Auflösung.
        Abweichende Bedingungen des Auftraggebers gelten nur, wenn wir ihnen
        schriftlich zustimmen.
      </p>

      <h2>§ 2 Angebot und Vertragsschluss</h2>
      <p>
        Die auf unserer Website im Preisrechner ausgegebenen Beträge sind
        unverbindliche Schätzungen und kein Angebot. Ein Vertrag kommt erst
        zustande, wenn der Auftraggeber ein von uns erstelltes schriftliches
        Angebot annimmt — schriftlich, per E-Mail oder über die Annahmefunktion
        im Kundencenter unseres Rechnungssystems.
      </p>

      <h2>§ 3 Leistungsumfang</h2>
      <p>
        Der Umfang ergibt sich aus dem Angebot. Nicht darin genannte Leistungen
        sind nicht Vertragsbestandteil. Vor Ort gewünschte Zusatzleistungen
        rechnen wir nach Aufwand ab, sofern kein abweichender Preis vereinbart
        wird.
      </p>

      <h2>§ 4 Mitwirkung des Auftraggebers</h2>
      <p>
        Der Auftraggeber stellt sicher, dass wir zum vereinbarten Termin Zugang
        zum Objekt haben, und weist auf Besonderheiten hin — etwa auf
        Sondermüll, Asbestverdacht, defekte Elektrik oder empfindliche Böden.
        Bei Entrümpelungen entfernt der Auftraggeber persönliche Dokumente,
        Wertsachen und alles, was erhalten bleiben soll, vorab oder kennzeichnet
        es deutlich.
      </p>

      <h2>§ 5 Preise und Umsatzsteuer</h2>
      <p>
        Alle Preise gegenüber Verbrauchern sind Endpreise einschließlich der
        gesetzlichen Umsatzsteuer von derzeit 19 %. Gegenüber Unternehmern
        weisen wir Netto-Preise zuzüglich Umsatzsteuer aus. Auf jeder Rechnung
        weisen wir den Arbeitslohn getrennt aus, damit Privatkunden die
        Steuerermäßigung für haushaltsnahe Dienstleistungen nach § 35a EStG in
        Anspruch nehmen können.
      </p>

      <h2>§ 6 Zahlungsbedingungen</h2>
      <p>
        Rechnungen sind ohne Abzug innerhalb von{" "}
        <Fehlt>Zahlungsziel, z. B. 14 Tagen</Fehlt> nach Zugang zur Zahlung
        fällig. Bei Aufträgen über <Fehlt>Betrag</Fehlt> können wir eine
        Anzahlung verlangen. Die Zahlung erfolgt per Überweisung — das ist
        zugleich Voraussetzung für die steuerliche Absetzbarkeit nach § 35a
        EStG.
      </p>

      <h2>§ 7 Termine</h2>
      <p>
        Termine sind verbindlich, sobald sie schriftlich oder per Nachricht
        bestätigt wurden. Können wir einen Termin aus Gründen nicht einhalten,
        die wir nicht zu verantworten haben — etwa Unwetter bei Gartenarbeiten
        —, vereinbaren wir unverzüglich einen Ersatztermin. Kosten entstehen
        dem Auftraggeber dadurch nicht.
      </p>

      <h2>§ 8 Stornierung durch den Auftraggeber</h2>
      <p>
        Sagt der Auftraggeber einen verbindlich vereinbarten Termin ab, können
        wir folgende Pauschalen für den entstandenen Aufwand verlangen:
      </p>
      <ul>
        <li>
          Absage bis <Fehlt>Frist, z. B. 48 Stunden</Fehlt> vor dem Termin:
          kostenfrei.
        </li>
        <li>
          Spätere Absage oder Absage am Tag der Ausführung:{" "}
          <Fehlt>Pauschale, im Gespräch waren 50 € genannt</Fehlt>.
        </li>
      </ul>
      <p>
        <strong>
          Dem Auftraggeber bleibt ausdrücklich der Nachweis vorbehalten, dass
          uns kein oder ein wesentlich geringerer Schaden entstanden ist. In
          diesem Fall entfällt die Pauschale oder reduziert sich entsprechend.
        </strong>{" "}
        Umgekehrt bleibt uns der Nachweis eines höheren Schadens vorbehalten.
      </p>

      <h2>§ 9 Widerrufsrecht für Verbraucher</h2>
      <p>
        Verbraucher haben ein vierzehntägiges Widerrufsrecht, wenn der Vertrag
        im Fernabsatz — etwa telefonisch, per E-Mail oder über das Formular —
        oder außerhalb unserer Geschäftsräume, also zum Beispiel in der Wohnung
        des Auftraggebers, geschlossen wurde. Die Frist beginnt mit
        Vertragsschluss.
      </p>
      <p>
        Soll die Leistung schon vor Ablauf der Widerrufsfrist beginnen, benötigen
        wir dafür die ausdrückliche Zustimmung des Auftraggebers sowie seine
        Kenntnisnahme, dass er das Widerrufsrecht bei vollständiger
        Vertragserfüllung verliert. Widerruft er danach, schuldet er einen dem
        Umfang der bereits erbrachten Leistung entsprechenden Betrag.
      </p>
      <p>
        <Fehlt>
          Vollständige Widerrufsbelehrung und Muster-Widerrufsformular nach
          Anlage 1 und 2 zu Art. 246a EGBGB ergänzen
        </Fehlt>
      </p>

      <h2>§ 10 Gewährleistung und Mängel</h2>
      <p>
        Mängel sind uns unverzüglich nach Feststellung anzuzeigen. Wir haben das
        Recht zur Nacherfüllung. Bei Entrümpelungen und Reinigungsleistungen ist
        eine gemeinsame Abnahme vor Ort vorgesehen; wir dokumentieren den
        Zustand vor und nach dem Einsatz mit Fotos.
      </p>

      <h2>§ 11 Haftung</h2>
      <p>
        Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei
        Verletzung von Leben, Körper oder Gesundheit. Bei einfacher
        Fahrlässigkeit haften wir nur für die Verletzung wesentlicher
        Vertragspflichten und begrenzt auf den vorhersehbaren, typischen
        Schaden. Es besteht eine Betriebshaftpflichtversicherung bei{" "}
        <Fehlt>Versicherer und Deckungssumme</Fehlt>.
      </p>

      <h2>§ 12 Entsorgung und Verwertung</h2>
      <p>
        Bei Entrümpelungen entsorgen wir fachgerecht und getrennt. Verwertbare
        Gegenstände können wir gegen den Auftragswert anrechnen; die Höhe wird
        vor dem Einsatz vereinbart. Sondermüll und kennzeichnungspflichtige
        Abfälle rechnen wir gesondert ab.
      </p>

      <h2>§ 13 Schlussbestimmungen</h2>
      <p>
        Es gilt deutsches Recht. Sollte eine Bestimmung unwirksam sein, bleibt
        die Wirksamkeit der übrigen unberührt. Änderungen dieser Bedingungen
        bedürfen der Schriftform.
      </p>
    </LegalLayout>
  );
}
