import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";
import { business } from "@/lib/business";
import { EINWILLIGUNG_COOKIE } from "@/lib/tracking/einwilligung";
import { PREISRECHNER_AKTIV } from "@/lib/features";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Datenschutzerklärung",
  description: PREISRECHNER_AKTIV
    ? `Wie ${business.name} Ihre Anfrage verarbeitet, warum der Preisrechner ` +
      "nichts überträgt, wann der Meta-Pixel läuft und welche Rechte Sie haben."
    : `Wie ${business.name} Ihre Anfrage verarbeitet, wann der Meta-Pixel ` +
      "läuft, wie lange wir speichern und welche Rechte Sie haben.",
  path: "/datenschutz",
});

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

   Seit 06.11.2026 (Angebot AG2026037, Positionen 3 und 4) gibt es einen
   Einwilligungsbanner, den Meta-Pixel und die Conversions API. Ohne
   Entscheidung gilt die Messung vom 14.08. weiter, und qa-tests/
   einwilligung.spec.ts hält das fest: kein Cookie, kein fremder Host. Erst
   „Alle akzeptieren“ bzw. das Häkchen bei Marketing lädt etwas von Meta.
   Rechtsstand und Quellen stehen im Commit-Text vom 06.11.2026. Am selben
   Tag sind alle VERIFY-Punkte geklärt worden: Belege oder eigene Messungen
   stehen als Kommentar an der jeweiligen Stelle. Ändert sich einer davon
   (Vercel-Tarif, Meta-Bedingungen, DPF), muss der Text mit.

   Solange der Preisrechner aus ist (lib/features.ts, seit 06.11.2026),
   entfallen Abschnitt 4 und die übrigen Hinweise auf ihn, die folgenden
   Abschnitte rücken eine Nummer auf. Der Text beschreibt so weiter nur, was
   tatsächlich passiert. Querverweise auf Abschnittsnummern gibt es keine.
   ================================================================== */

/** Vorhandene Profile aus lib/business.ts, leere Einträge fallen heraus. */
const profilLinks = [
  { name: "Instagram", url: business.social.instagram },
  { name: "Facebook", url: business.social.facebook },
].filter((p): p is { name: string; url: string } => Boolean(p.url));

/** Abschnittsnummer: ohne Rechner fällt Abschnitt 4 weg. */
function nr(n: number): number {
  return PREISRECHNER_AKTIV || n < 4 ? n : n - 1;
}

export default function DatenschutzPage() {
  return (
    <LegalLayout
      title="Datenschutzerklärung"
      updated={PREISRECHNER_AKTIV ? "August 2026" : "November 2026"}
    >
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
      {/* Art. 21 Abs. 4 DSGVO verlangt den Hinweis auf das Widerspruchsrecht
          „in einer verständlichen und von anderen Informationen getrennten
          Form“, deshalb eigener, abgesetzter Block. */}
      <div className="my-6 border-l-2 border-gold pl-4">
        <p>
          <strong>Ihr Widerspruchsrecht nach Art. 21 DSGVO</strong>
        </p>
        <p>
          Soweit wir Daten auf Grundlage unseres berechtigten Interesses
          verarbeiten (Art. 6 Abs. 1 lit. f DSGVO), etwa bei den Server-Logs und
          den Statistiken zu unseren Social-Media-Profilen, können Sie dieser
          Verarbeitung jederzeit aus Gründen widersprechen, die sich aus Ihrer
          besonderen Situation ergeben. Wir verarbeiten die Daten dann nicht
          mehr, es sei denn, wir können zwingende schutzwürdige Gründe
          nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder
          die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung
          von Rechtsansprüchen. Eine Einwilligung können Sie ohne Angabe von
          Gründen widerrufen, für Cookies jederzeit über „Cookie-Einstellungen“
          am Ende jeder Seite.
        </p>
      </div>
      <p>
        Außerdem können Sie sich bei einer Aufsichtsbehörde beschweren
        (Art. 77 DSGVO). Für uns zuständig ist das Unabhängige Landeszentrum
        für Datenschutz Schleswig-Holstein, Holstenstraße 98, 24103 Kiel.
      </p>
      <p>
        Eine automatisierte Entscheidungsfindung einschließlich Profiling nach
        Art. 22 DSGVO findet nicht statt.
        {PREISRECHNER_AKTIV &&
          " Der Preisrechner erzeugt lediglich eine unverbindliche Schätzung " +
            "und trifft keine Entscheidung über Sie."}
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
        {/* Vercel-Team „sassedennis-2652s-projects“ am 06.11.2026 auf Tarif Pro
            ohne Observability Plus geprüft. Laufzeitprotokolle laut
            vercel.com/docs/runtime-logs: Pro 1 Tag (Hobby 1 Stunde, mit
            Observability Plus 30 Tage). Ändert sich der Tarif, Satz anpassen. */}
        Diese Protokolle können wir in unserem Tarif einen Tag lang einsehen,
        danach sind sie für uns nicht mehr abrufbar. Eine eigene Speicherung
        darüber hinaus findet nicht statt.
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

      {PREISRECHNER_AKTIV && (
        <>
          <h2>4. Preisrechner</h2>
          <p>
            Der Preisrechner läuft vollständig in Ihrem Browser. Ihre Eingaben
            werden dabei <strong>nicht</strong> an uns übertragen und nicht
            gespeichert. Erst wenn Sie auf „Unverbindliche Anfrage stellen“
            klicken und das Formular absenden, werden die Angaben zusammen mit
            Ihren Kontaktdaten übermittelt.
          </p>
        </>
      )}

      <h2>{nr(5)}. Anfrageformular</h2>
      <p>
        Wir verarbeiten die von Ihnen eingegebenen Daten, um Ihre Anfrage zu
        bearbeiten. Als Privatkunde sind das Name, Telefonnummer, optional
        E-Mail-Adresse, die Anschrift des Einsatzortes und Ihre Nachricht
        {PREISRECHNER_AKTIV && " sowie die Angaben aus dem Preisrechner"}. Fragen
        Sie über den
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
        Haben Sie in die Kategorie „Marketing“ eingewilligt, melden wir das
        erfolgreiche Absenden zusätzlich als Ereignis „Lead“ an Meta. Ihre
        E-Mail-Adresse und Telefonnummer gehen dabei nur als Hashwert mit, Name,
        Anschrift und Nachricht gar nicht. Einzelheiten stehen unten unter
        „Meta-Pixel und Conversions API“.
      </p>
      <p>
        Im internen Bereich kann zu einer Anfrage eine abweichende
        Rechnungsanschrift ergänzt werden, außerdem der Bearbeitungsstand und
        eine interne Notiz. Diese Angaben stammen aus dem Kontakt mit Ihnen,
        etwa aus einem Telefonat oder dem Termin vor Ort.
      </p>

      <h2>{nr(6)}. Speicherdauer</h2>
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

      <h2>{nr(7)}. E-Mail-Versand</h2>
      <p>
        Für den Versand von Benachrichtigungen und Bestätigungen nutzen wir den
        Mailserver der Hetzner Online GmbH, Industriestraße 25, 91710
        Gunzenhausen. Die Server stehen in Deutschland. E-Mails werden
        transportverschlüsselt übertragen, sofern der empfangende Server das
        unterstützt; eine Ende-zu-Ende-Verschlüsselung findet nicht statt.
      </p>

      <h2 id="cookies">{nr(8)}. Cookies und Einwilligung</h2>
      <p>
        Solange Sie keine Auswahl getroffen haben, setzt diese Website{" "}
        <strong>keine Cookies</strong>, legt nichts im lokalen Speicher oder im
        Sitzungsspeicher Ihres Browsers ab und lädt nichts von fremden Servern.
        Beim ersten Besuch fragen wir Sie in einem Banner, ob wir den Meta-Pixel
        und die Conversions API nutzen dürfen. Dabei gibt es zwei Kategorien:
      </p>
      <ul>
        <li>
          <strong>Notwendig</strong> (immer aktiv): speichert Ihre Auswahl.
        </li>
        <li>
          <strong>Marketing</strong> (nur mit Ihrer Einwilligung): Meta-Pixel und
          Conversions API, beschrieben im nächsten Abschnitt.
        </li>
      </ul>
      <p>
        „Alle akzeptieren“ und „Nur notwendige“ stehen gleichwertig
        nebeneinander, unter „Einstellungen“ wählen Sie je Kategorie. Das Feld
        für Marketing ist nie vorausgewählt.
      </p>
      <p>
        Ihre Auswahl speichern wir im Cookie „{EINWILLIGUNG_COOKIE}“ in Ihrem
        Browser: die Version des Banners, ob Sie Marketing erlaubt haben, und
        den Zeitpunkt Ihrer Entscheidung. Das Cookie gilt zwölf Monate, danach
        fragen wir erneut. Auf unserem Server legen wir kein eigenes Protokoll
        Ihrer Entscheidung an. Das Speichern ist unbedingt erforderlich, damit
        die Website sich Ihre Auswahl merkt und nicht bei jedem Aufruf erneut
        fragt (§ 25 Abs. 2 Nr. 2 TDDDG). Rechtsgrundlage der Verarbeitung ist
        Art. 6 Abs. 1 lit. c DSGVO in Verbindung mit Art. 7 Abs. 1 DSGVO, der
        uns verpflichtet, eine Einwilligung nachweisen zu können.
      </p>
      <p>
        <strong>Widerruf:</strong> Über den Link „Cookie-Einstellungen“ am Ende
        jeder Seite können Sie Ihre Auswahl jederzeit ändern und eine
        Einwilligung mit Wirkung für die Zukunft widerrufen. Bei einem Widerruf
        löschen wir die Meta-Cookies „_fbp“ und „_fbc“ in Ihrem Browser, und es
        werden keine weiteren Daten an Meta übermittelt. Die Rechtmäßigkeit der
        bis dahin erfolgten Verarbeitung bleibt unberührt.
      </p>
      <p>
        Wenn Sie auf der Startseite „Privatkunde“ oder „Geschäftskunde“
        auswählen, erhöhen wir unabhängig von Ihrer Auswahl im Banner den
        jeweiligen Gesamtzähler um eins. Dabei speichern wir kein einzelnes
        Ereignis, keinen Zeitpunkt, keine IP-Adresse, keine Gerätekennung und
        kein Nutzerprofil. Die beiden anonymen Summen zeigen uns lediglich,
        welcher Seitenweg häufiger gewählt wird. Nur wenn Sie in Marketing
        eingewilligt haben, melden wir diese Wahl zusätzlich an Meta.
      </p>
      <p>
        Ein weiteres Cookie wird gesetzt, wenn sich ein Mitarbeiter im internen
        Bereich anmeldet. Es ist für den Anmeldevorgang unbedingt erforderlich
        (§ 25 Abs. 2 Nr. 2 TDDDG), enthält nur ein signiertes Sitzungsmerkmal
        und keine personenbezogenen Daten. Für Besucher der öffentlichen Seiten
        entsteht es nicht.
      </p>

      <h2 id="meta">{nr(9)}. Meta-Pixel und Conversions API</h2>
      <p>
        Nur wenn Sie in die Kategorie „Marketing“ eingewilligt haben, nutzen wir
        den Meta-Pixel und die Conversions API der Meta Platforms Ireland
        Limited, Block J, Serpentine Avenue, Dublin 4, Irland („Meta“).
        {/* Anschrift wie in Metas eigenen Vertragstexten: Nutzungsbedingungen
            für Meta Business Tools (Fassung 03.11.2025) und Seiten-Insights-
            Ergänzung (25.04.2023), beide abgerufen am 06.11.2026. Das irische
            Register (Firmennr. 462932) führt als Sitz Merrion Road, Dublin 4. */}{" "}
        Damit messen
        wir, ob unsere Anzeigen auf Facebook und Instagram zu Anfragen führen,
        und spielen Anzeigen an passende Zielgruppen aus.
      </p>
      <p>
        <strong>So funktioniert es:</strong> Der Meta-Pixel ist ein Skript, das
        Ihr Browser von Servern von Meta lädt. Er setzt die Cookies „_fbp“
        (zufällige Kennung Ihres Browsers) und, wenn Sie über eine Anzeige
        kommen, „_fbc“ (Kennung des Anzeigenklicks), und meldet Ereignisse an
        Meta. Über die Conversions API meldet unser Server diese Ereignisse
        zusätzlich direkt an Meta, nur Seitenwechsel innerhalb der Website
        meldet allein der Pixel. Beide Meldungen tragen dieselbe zufällige
        Ereignis-ID, damit Meta sie nur einmal zählt.
      </p>
      <p>
        <strong>Diese Ereignisse melden wir:</strong>
      </p>
      <ul>
        <li>Aufruf einer Seite</li>
        <li>Aufruf einer Leistungsseite, mit dem Namen der Leistung</li>
        <li>Wahl zwischen Privat- und Geschäftskundenbereich auf der Startseite</li>
        <li>Klick auf unsere Telefonnummer oder den WhatsApp-Link</li>
        <li>
          erfolgreich abgeschickte Anfrage, mit der Angabe Privat- oder
          Geschäftskunde und der gewählten Leistung
        </li>
      </ul>
      <p>
        <strong>Diese Daten werden dabei übermittelt:</strong> Ihre IP-Adresse,
        Angaben zu Ihrem Browser (User-Agent), die Adresse der aufgerufenen
        Seite, der Zeitpunkt, die Kennungen aus „_fbp“ und „_fbc“ sowie die
        Ereignis-ID. Bei einer Anfrage zusätzlich Ihre E-Mail-Adresse und
        Telefonnummer, aber nur als SHA-256-Hashwert. Meta kann diese Werte mit
        den Angaben in einem Meta-Konto abgleichen. Name, Anschrift und den
        Text Ihrer Nachricht übermitteln wir nicht. Automatische Ereignisse des
        Pixels (etwa das selbständige Erfassen von Klicks) haben wir
        abgeschaltet.
      </p>
      <p>
        <strong>Zwecke:</strong> Messung der Wirkung unserer Werbung
        (Conversion-Messung), Optimierung der Anzeigenauslieferung und Bildung
        von Zielgruppen. Dazu gehören Zielgruppen aus Besuchern dieser Website,
        etwa aus Besuchern, die den Geschäftskundenbereich gewählt haben, und
        daraus abgeleitete ähnliche Zielgruppen („Lookalike Audiences“). Wir
        erhalten von Meta nur zusammengefasste Auswertungen, keine Daten über
        einzelne Personen. Haben Sie ein Konto bei Facebook oder Instagram,
        kann Meta die Ereignisse Ihrem Konto zuordnen.
      </p>
      <p>
        <strong>Rechtsgrundlage</strong> ist Ihre Einwilligung, für das Setzen
        und Auslesen der Cookies nach § 25 Abs. 1 TDDDG, für die weitere
        Verarbeitung nach Art. 6 Abs. 1 lit. a DSGVO.
      </p>
      <p>
        <strong>Verantwortlichkeit:</strong> Für die Erhebung der Daten auf
        dieser Website und ihre Übermittlung an Meta sind wir mit Meta gemeinsam
        verantwortlich (Art. 26 DSGVO). Grundlage ist die{" "}
        <a href="https://www.facebook.com/legal/controller_addendum" rel="noopener">
          Zusatzvereinbarung für Verantwortliche
        </a>{" "}
        als Teil der{" "}
        <a href="https://www.facebook.com/legal/businesstech" rel="noopener">
          Nutzungsbedingungen für Meta Business Tools
        </a>
        . Danach informieren wir Sie und holen Ihre Einwilligung ein. Soweit
        Meta die Daten für uns abgleicht und daraus Auswertungen erstellt,
        handelt Meta als unser Auftragsverarbeiter (
        <a href="https://www.facebook.com/legal/terms/dataprocessing" rel="noopener">
          Datenverarbeitungsbedingungen
        </a>
        ). Für die weitere Verarbeitung zu eigenen Zwecken, etwa zur Auslieferung
        und Verbesserung von Werbung, ist Meta allein verantwortlich. Ihre Rechte
        können Sie bei uns und bei Meta geltend machen.
        {/* Rollen nach Ziff. 5.a der Nutzungsbedingungen für Meta Business Tools
            (Fassung 03.11.2025): gemeinsam verantwortlich für Erhebung und
            Übermittlung (5.a.ii), Auftragsverarbeitung für Abgleich und Messung
            (5.a.i). Die Bedingungen nennen Pixel und Conversions API
            ausdrücklich als Business Tools, beide Wege fallen also darunter. */}
      </p>
      <p>
        <strong>Übermittlung in die USA:</strong> Meta kann die Daten an die
        Meta Platforms, Inc. in den USA übermitteln. Grundlage ist der
        Angemessenheitsbeschluss der Europäischen Kommission zum
        EU-US Data Privacy Framework, unter dem Meta Platforms, Inc.
        zertifiziert ist.
        {/* DPF-Liste (dataprivacyframework.gov, Teilnehmer 4452) am 06.11.2026:
            „Active – Re-certification under Review“. EuG hat die Klage Latombe
            am 03.09.2025 abgewiesen (T-553/23), Rechtsmittel beim EuGH anhängig
            (C-703/25 P). Fällt der Beschluss, muss dieser Absatz neu. */}
      </p>
      <p>
        <strong>Speicherdauer:</strong> Die Cookies „_fbp“ und „_fbc“ laufen
        nach 90 Tagen ab, bei einem Widerruf löschen wir sie sofort.
        {/* Gemessen am 06.11.2026: fbevents.js 2.9.437 setzt _fbp und _fbc mit
            einer Laufzeit von 90,0 Tagen. */}{" "}
        Wir selbst speichern die gemeldeten Ereignisse nicht. Wie lange Meta
        die Daten speichert, richtet sich nach der{" "}
        <a href="https://www.facebook.com/privacy/policy/" rel="noopener">
          Datenschutzrichtlinie von Meta
        </a>
        . Website-Zielgruppen enthalten Besucher höchstens 180 Tage nach ihrem
        letzten passenden Besuch.
        {/* Metas Entwicklerdoku „Website Custom Audiences“: Aufbewahrung 1 bis
            180 Tage (abgerufen 06.11.2026). Längere Fristen gibt es nur für
            Kaufereignisse, die diese Seite nicht meldet. */}
      </p>
      <p>
        <strong>Widerruf und Widerspruch:</strong> über „Cookie-Einstellungen“
        am Ende jeder Seite. Wenn Sie ein Meta-Konto haben, können Sie dort in
        den Werbepräferenzen außerdem einstellen, ob Meta Ihre Aktivitäten
        außerhalb seiner Dienste für Werbung nutzt.
      </p>

      <h2>{nr(10)}. Externe Dienste</h2>
      <p>
        Ohne Ihre Einwilligung wird beim Aufruf dieser Website{" "}
        <strong>kein fremder Server kontaktiert</strong>. Schriften, Bilder und
        Videos in den Seitenköpfen werden von unserem eigenen Server geladen. Es
        besteht insbesondere keine Verbindung zu Google-Servern, es wird also
        auch keine IP-Adresse an Google übermittelt. Erst mit einer Einwilligung
        in Marketing lädt Ihr Browser den Meta-Pixel von Servern von Meta.
      </p>
      <p>
        Wir binden weder eine Google-Maps-Karte noch Social-Media-Plugins ein.
        Verweise auf externe Dienste, auch auf unsere Social-Media-Profile, sind
        einfache Links. Erst durch Ihren Klick entsteht eine Verbindung zum
        jeweiligen Anbieter.
      </p>

      <h2>{nr(11)}. WhatsApp</h2>
      <p>
        Wenn Sie uns über den WhatsApp-Link kontaktieren, verlassen Sie diese
        Website. Die WhatsApp Ireland Limited verarbeitet Ihre Daten dann nach
        eigenen Bestimmungen, worauf wir keinen Einfluss haben. Die Nachricht
        wird lediglich in Ihrer App vorbereitet; abgeschickt wird sie erst durch
        Sie. Für sensible Angaben nutzen Sie bitte das Formular, das Telefon
        oder die E-Mail.
      </p>

      {/* Facebook erscheint hier, sobald social.facebook in lib/business.ts
          gesetzt ist. Bis dahin beschreibt der Text nur, was es gibt. */}
      <h2 id="profile">
        {nr(12)}. Unsere Profile bei{" "}
        {profilLinks.map((p) => p.name).join(" und ") || "Instagram und Facebook"}
      </h2>
      <p>
        Wir unterhalten{" "}
        {profilLinks.map((p, i) => (
          <span key={p.name}>
            {i > 0 && " und "}
            <a href={p.url} rel="noopener">
              {p.name === "Facebook" ? "eine Seite bei Facebook" : "ein Profil bei Instagram"}
            </a>
          </span>
        ))}
        . Anbieter ist die Meta Platforms Ireland Limited, Block J, Serpentine
        Avenue, Dublin 4, Irland. Wenn Sie unser Profil
        besuchen, verarbeitet Meta Ihre Daten nach eigenen Bestimmungen, siehe
        die{" "}
        <a href="https://www.facebook.com/privacy/policy/" rel="noopener">
          Datenschutzrichtlinie von Meta
        </a>
        . Cookies holt Meta dort selbst über eine eigene Abfrage ein.
      </p>
      <p>
        Meta stellt uns zu unseren Profilen Statistiken bereit („Insights“),
        etwa wie viele Personen unsere Beiträge gesehen haben. Wir erhalten nur
        zusammengefasste Zahlen, keine Daten über einzelne Besucher, und können
        die Erhebung selbst nicht beeinflussen. Für die Verarbeitung zu diesen
        Statistiken sind wir nach der Rechtsprechung des Europäischen
        Gerichtshofs (Urteil vom 05.06.2018, C-210/16) mit Meta gemeinsam
        verantwortlich (Art. 26 DSGVO).
        {business.social.facebook && (
          <>
            {" "}Für unsere Facebook-Seite regelt das die{" "}
            <a
              href="https://www.facebook.com/legal/terms/page_controller_addendum"
              rel="noopener"
            >
              Seiten-Insights-Ergänzung
            </a>{" "}
            von Meta (weitere Angaben in den{" "}
            <a
              href="https://www.facebook.com/legal/terms/information_about_page_insights_data"
              rel="noopener"
            >
              Informationen zu Seiten-Insights
            </a>
            ). Danach übernimmt Meta die Erfüllung Ihrer Rechte zu diesen Daten.
          </>
        )}{" "}
        {/* Die Seiten-Insights-Ergänzung (25.04.2023) gilt nur für Facebook-
            Seiten, Instagram nennt sie nicht (geprüft 06.11.2026). Deshalb hier
            keine Behauptung, sie decke das Instagram-Profil ab. */}
        Für Instagram-Profile hat Meta keine eigene Vereinbarung dazu
        veröffentlicht. Ihre Rechte können Sie bei uns und bei Meta geltend
        machen. Anfragen, die nur Meta beantworten kann, leiten wir unverzüglich
        an Meta weiter.
      </p>
      <p>
        Rechtsgrundlage ist unser berechtigtes Interesse an einem Auftritt dort,
        wo unsere Kunden unterwegs sind, und an der Auswertung seiner Reichweite
        (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p>
        Schreiben Sie uns dort eine Nachricht, verarbeiten wir sie, um Ihre
        Anfrage zu beantworten (Art. 6 Abs. 1 lit. b DSGVO). Meta kann Daten in
        die USA übermitteln, gestützt auf das EU-US Data Privacy Framework.
        Ihre Rechte können Sie bei uns und bei Meta geltend machen.
      </p>

      <h2>{nr(13)}. KI-generierte Medien auf dieser Website</h2>
      <p>
        Ein Teil der Bilder und Videos auf dieser Website wurde mit Hilfe
        künstlicher Intelligenz erzeugt. Diese Medien sind sichtbar als
        „KI-generiert“ gekennzeichnet und zusätzlich in den Dateimetadaten
        ausgewiesen. Sobald eigene Aufnahmen von Einsätzen vorliegen, ersetzen
        wir sie.
      </p>
    </LegalLayout>
  );
}
