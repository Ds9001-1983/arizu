import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { AnfrageSection } from "@/components/site/anfrage-section";
import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-section";
import { KonfiguratorTabs } from "@/components/site/konfigurator-tabs";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceGrid } from "@/components/site/service-grid";
import { business } from "@/lib/business";
import { getAllRates } from "@/lib/rates-server";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Privatkunden — Richtpreis für Gebäudedienstleistungen",
  description:
    "Objektbetreuung, Gebäudereinigung, Gartenpflege und Entrümpelung für " +
    "Privathaushalte. Richtpreis sofort und ohne Kontaktdaten berechnen.",
  alternates: { canonical: "/privatkunden" },
};

/* Je Leistung die stärkste Frage auf der Übersichtsseite. Die vollständigen
   FAQs bleiben auf den vier Detailseiten. */
const privateFaqs = services.map((s) => s.faqs[0]);

/* Arians Preisänderung frischt diese Seite über app/intern/actions.ts sofort
   auf. Der Tag ist nur das Sicherheitsnetz für verpasste Invalidierungen. */
export const revalidate = 86_400;

export default async function PrivatkundenPage() {
  const rates = await getAllRates();

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
            title="Klare Leistungen. Ein Richtpreis vor der Anfrage."
            lead={`Von der Treppenhausreinigung bis zur Wohnungsauflösung: ${business.shortName} übernimmt Arbeiten rund um Haus, Wohnung und Garten. Den Preisrahmen sehen Sie sofort — ohne zuerst Kontaktdaten abzugeben.`}
          />

          <a
            href="#richtpreis"
            className="mt-9 inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 font-display text-sm font-bold text-white transition-colors hover:bg-navy-band"
          >
            Richtpreis berechnen
            <ArrowRight className="size-4" aria-hidden />
          </a>
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
            eyebrow="Richtpreis in 60 Sekunden"
            title="Was kostet das? Sehen Sie selbst."
            lead="Sie bekommen sofort eine Zahl — ohne Ihre Daten abzugeben. Erst danach entscheiden Sie, ob Sie anfragen möchten."
          />
          <div className="mt-12">
            <KonfiguratorTabs rates={rates} />
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
