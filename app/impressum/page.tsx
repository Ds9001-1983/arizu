import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/legal-layout";
import { business } from "@/lib/business";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum und Anbieterkennzeichnung von ${business.name}.`,
  alternates: { canonical: "/impressum" },
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <LegalLayout title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {business.legalName}
        <br />
        {business.address.street}
        <br />
        {business.address.postalCode} {business.address.city}
        <br />
        {business.address.countryName}
      </p>

      <h2>Vertreten durch</h2>
      <p>{business.owner}</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href={business.phone.href}>{business.phone.display}</a>
        <br />
        E-Mail: <a href={`mailto:${business.email}`}>{business.email}</a>
      </p>

      <h2>Umsatzsteuer</h2>
      <p>
        Eine Umsatzsteuer-Identifikationsnummer gemäß § 27 a
        Umsatzsteuergesetz liegt noch nicht vor — der Betrieb befindet sich in
        Gründung. Sie wird hier ergänzt, sobald sie erteilt ist.
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>
        {business.owner}, Anschrift wie oben.
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht verpflichtet und nicht bereit, an einem
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Die Inhalte dieser Seiten wurden mit Sorgfalt erstellt. Für die
        Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
        jedoch keine Gewähr übernehmen. Die im Preisrechner ausgegebenen Beträge
        sind unverbindliche Schätzungen und stellen kein Angebot im Sinne des
        § 145 BGB dar.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren
        Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten
        ist stets der jeweilige Anbieter verantwortlich.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch uns erstellten Inhalte und Werke auf diesen Seiten
        unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung
        und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen
        unserer schriftlichen Zustimmung.
      </p>
    </LegalLayout>
  );
}
