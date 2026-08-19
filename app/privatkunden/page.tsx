import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeEuro } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { AnfrageSection } from "@/components/site/anfrage-section";
import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-section";
import { KonfiguratorTabs } from "@/components/site/konfigurator-tabs";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceGrid } from "@/components/site/service-grid";
import { getAllRates } from "@/lib/rates-server";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Privatkunden — Preisschätzung für Gebäudedienstleistungen",
  description:
    "Preisschätzung für Gebäudereinigung, Grün- und Außenanlagenpflege sowie " +
    "Entrümpelung und Auflösung sofort und ohne Kontaktdaten berechnen. " +
    "Objektbetreuung individuell anfragen.",
  alternates: { canonical: "/privatkunden" },
};

/* Je Leistung die stärkste Frage auf der Übersichtsseite. Die vollständigen
   FAQs bleiben auf den vier Detailseiten. */
const privateFaqs = services.map((s) => s.faqs[0]);

/* Arians Preisänderung frischt diese Seite über app/intern/actions.ts sofort
   auf. Der Tag ist nur das Sicherheitsnetz für verpasste Invalidierungen. */
export const revalidate = 86_400;

export default async function PrivatkundenPage() {
  const allRates = await getAllRates();
  const publicRates = {
    gebaeudereinigung: allRates.gebaeudereinigung,
    gartenpflege: allRates.gartenpflege,
    entruempelung: allRates.entruempelung,
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: "Privatkunden", path: "/privatkunden" },
          ]),
          faqSchema(privateFaqs),
        ]}
      />

      <section className="bg-shell pt-10 pb-16 sm:pt-14">
        <Container>
          <nav aria-label="Brotkrumen" className="mb-8 text-sm text-ink-muted">
            <Link href="/" className="hover:text-navy">
              Start
            </Link>
            <span className="mx-2" aria-hidden>
              ›
            </span>
            <span className="text-navy">Privatkunden</span>
          </nav>

          <SectionHeading
            as="h1"
            eyebrow="Privatkunden"
            title="Klare Leistungen. Eine Preisschätzung vor der Anfrage."
            lead={
              <>
                Wir bieten Ihnen professionelle Dienstleistungen aus einer Hand. Wir
                stehen für zuverlässige Ausführung, transparente Abläufe und faire
                Preise.
                <span className="mt-4 block">
                  Dank unserer digitalen Preiseinschätzung können Sie sich direkt
                  einen ersten Eindruck von den Kosten verschaffen – schnell,
                  unkompliziert und ohne Kontaktdaten.
                </span>
              </>
            }
          />

          <a
            href="#richtpreis"
            className="mt-9 inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 font-display text-sm font-bold text-white transition-colors hover:bg-navy-band"
          >
            Preisschätzung ansehen
            <ArrowRight className="size-4" aria-hidden />
          </a>
        </Container>
      </section>

      <section className="bg-navy py-16 text-white">
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
            <BadgeEuro
              className="size-12 shrink-0 text-gold"
              strokeWidth={1.5}
              aria-hidden
            />
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl text-white sm:text-3xl">
                20 % der Arbeitskosten holen Sie vom Finanzamt zurück
              </h2>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-white/75">
                Reinigung, Grün- und Außenanlagenpflege sowie Hausmeisterleistungen
                im Privathaushalt gelten als haushaltsnahe Dienstleistungen. Sie können
                20 % der Arbeitskosten von der Steuer absetzen, bis zu 4.000 € im
                Jahr (§ 35a EStG). Voraussetzung: eine Rechnung und Zahlung per
                Überweisung — Barzahlung erkennt das Finanzamt nicht an. Wir weisen
                den Arbeitslohn auf jeder Rechnung getrennt aus, damit Sie den Betrag
                direkt eintragen können.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Unsere Dienstleistungen"
            title="Vier Bereiche, ein Ansprechpartner"
            lead="Von der regelmäßigen Pflege bis zum einmaligen Einsatz — Sie müssen nicht mehrere Firmen koordinieren."
          />
          <div className="mt-12">
            <ServiceGrid />
          </div>
        </Container>
      </section>

      <section id="richtpreis" className="scroll-mt-20 bg-mist/40 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Preisschätzung in 60 Sekunden"
            title="Was kostet das? Sehen Sie selbst."
            lead="Sie bekommen sofort eine Zahl — ohne Ihre Daten abzugeben. Erst danach entscheiden Sie, ob Sie anfragen möchten."
          />
          <div className="mt-12">
            <KonfiguratorTabs rates={publicRates} />
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Häufige Fragen"
            title="Was Privatkunden zuerst wissen wollen"
          />
          <div className="mt-10">
            <FaqList faqs={privateFaqs} />
          </div>
        </Container>
      </section>

      <AnfrageSection />
    </>
  );
}
