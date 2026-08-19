import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building,
  Building2,
  CalendarCheck,
  GraduationCap,
  ReceiptText,
  Shapes,
  Store,
  Stethoscope,
  UserCheck,
  Workflow,
  Zap,
} from "lucide-react";
import { B2bForm } from "@/components/site/b2b-form";
import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-section";
import { HeroMedia } from "@/components/site/hero-media";
import { SectionHeading } from "@/components/site/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { business, serviceArea } from "@/lib/business";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";
import { services, type Faq } from "@/lib/services";

/* ==================================================================
   Geschäftskundenbereich.

   Bewusst eine eigenständige Route und KEINE fünfte Leistung — Begründung
   steht in lib/b2b.ts. Kein Konfigurator, kein Richtpreis: So im
   Kundengespräch vom 14.08.2026 verabredet.

   Im Hero wird das vorhandene Startseitenmotiv bewusst wiederverwendet. So
   bleibt der Geschäftskunden-Einstieg visuell konsistent, ohne ein weiteres
   fotorealistisches KI-Asset einzuführen.
   ================================================================== */

export const metadata: Metadata = {
  title: `Geschäftskunden — Gebäudedienstleistungen für Unternehmen`,
  description:
    "Gebäudereinigung, Grün- und Außenanlagenpflege, Entrümpelung und " +
    "Auflösung sowie Objektbetreuung für Unternehmen. Einsatzgebiet: " +
    `${serviceArea.label} sowie weitere Orte im Umkreis von ` +
    `${serviceArea.radiusKm} km um ${serviceArea.center}.`,
  alternates: { canonical: "/geschaeftskunden" },
};

const objektarten = [
  {
    icon: Building2,
    titel: "Bürogebäude",
    text: "Unterhaltsreinigung nach Ihrem Takt, auch außerhalb der Arbeitszeiten.",
  },
  {
    icon: Stethoscope,
    titel: "Praxen und Gesundheitseinrichtungen",
    text: "Erhöhte Anforderungen an Hygiene und Dokumentation, feste Kraft statt wechselndem Personal.",
  },
  {
    icon: Building,
    titel: "Wohnanlagen und Hausverwaltungen",
    text: "Treppenhaus, Außenanlagen, Mülltonnen und Winterdienst aus einer Hand — je Objekt abgerechnet.",
  },
  {
    icon: Store,
    titel: "Ladenlokale und Gastronomie",
    text: "Vor Öffnung oder nach Feierabend, damit der Betrieb nicht steht.",
  },
  {
    icon: GraduationCap,
    titel: "Bildung & öffentliche Einrichtungen",
    text: "Zuverlässige Reinigung und Betreuung für Schulen, Kitas, Verwaltungsgebäude und öffentliche Einrichtungen – abgestimmt auf Nutzung und Betriebszeiten.",
  },
  {
    icon: Shapes,
    titel: "Weitere Objekte",
    text: "Individuelle Dienstleistungen für Gewerbe-, Wohn- und Sonderobjekte – flexibel abgestimmt auf die jeweiligen Anforderungen.",
  },
];

const arbeitsweise = [
  {
    icon: UserCheck,
    titel: "Ein Ansprechpartner",
    text: "Direkte Kommunikation ohne Umwege.",
  },
  {
    icon: Workflow,
    titel: "Klare Prozesse",
    text: "Strukturierte Abläufe von der Anfrage bis zur laufenden Betreuung.",
  },
  {
    icon: BadgeCheck,
    titel: "Feste Leistungsstandards",
    text: "Definierte Leistungen sorgen für nachvollziehbare Qualität.",
  },
  {
    icon: CalendarCheck,
    titel: "Planbare Betreuung",
    text: "Regelmäßige Leistungen werden zuverlässig eingehalten.",
  },
  {
    icon: Zap,
    titel: "Schnelle Reaktion",
    text: "Zusätzlicher Bedarf wird unkompliziert aufgenommen und abgestimmt.",
  },
  {
    icon: ReceiptText,
    titel: "Transparente Abrechnung",
    text: "Nachvollziehbar, übersichtlich und passend zum vereinbarten Leistungsumfang.",
  },
];

/* Eigene Fragen, bewusst KEINE aus services[].faqs: Die sind bereits auf der
   Startseite und den Leistungsseiten als FAQPage ausgezeichnet, und dieselbe
   Frage zweimal strukturiert auszuzeichnen schadet mehr als es nützt. */
const b2bFaqs: Faq[] = [
  {
    question: "Bekommen wir eine Sammelrechnung für mehrere Objekte?",
    answer:
      "Ja. Sie erhalten eine Rechnung im Monat, in der jedes Objekt einzeln " +
      "ausgewiesen ist. So bleibt die Zuordnung in Ihrer Buchhaltung erhalten, " +
      "ohne dass Sie mehrere Belege verarbeiten müssen.",
  },
  {
    question: "Was passiert, wenn jemand krank wird?",
    answer:
      "Die Vertretung ist Teil der Vereinbarung, nicht Ihr Problem. Fällt " +
      "jemand aus, kommt Ersatz — die vereinbarte Leistung wird erbracht.",
  },
  {
    question: "Arbeiten Sie auch außerhalb unserer Öffnungszeiten?",
    answer:
      "Ja, das ist bei Büros und Ladenlokalen sogar der Normalfall. Zeitfenster " +
      "und Schlüsselübergabe klären wir bei der Begehung.",
  },
  {
    question: "Ab wann lohnt sich ein Rahmenvertrag?",
    answer:
      "Sobald die Leistung regelmäßig wiederkehrt. Der Vorteil liegt weniger " +
      "im Preis als in der Planbarkeit: feste Termine, feste Ansprechpartner, " +
      "keine Einzelbeauftragung. Kündbar bleibt er monatlich.",
  },
];

export default function GeschaeftskundenPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: "Geschäftskunden", path: "/geschaeftskunden" },
          ]),
          faqSchema(b2bFaqs),
        ]}
      />

      <section className="relative isolate flex min-h-[clamp(39rem,78svh,48rem)] items-end overflow-hidden">
        <HeroMedia
          assetId="img-hero"
          alt="Modernes Mehrfamilienhaus mit gepflegtem Weg und geschnittenen Hecken"
          poster="/images/hero-gebaeude.webp"
          posterMobile="/images/hero-gebaeude-mobil.webp"
          video="/video/hero-gebaeude.mp4"
          videoMobile="/video/hero-gebaeude-mobil.mp4"
        />

        <Container className="relative z-10 py-12 sm:py-16">
          <nav aria-label="Brotkrumen" className="mb-8 text-sm text-white/70">
            <Link href="/" className="hover:text-white">
              Start
            </Link>
            <span className="mx-2" aria-hidden>
              ›
            </span>
            <span className="text-white">Geschäftskunden</span>
          </nav>

          <SectionHeading
            as="h1"
            invert
            eyebrow="Geschäftskunden"
            title="Gebäudedienstleistungen für Unternehmen, Hausverwaltungen & Gewerbeimmobilien"
            lead="Wir übernehmen Reinigung, Objektbetreuung sowie die Pflege von Außenanlagen für Büros, Praxen, Wohnanlagen und Gewerbeobjekte. Nach einer persönlichen Besichtigung vor Ort erhalten Sie ein transparentes Angebot – abgestimmt auf Ihren tatsächlichen Bedarf."
          />

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#bedarf"
              className="inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3.5 font-display text-sm font-bold text-navy transition-colors hover:bg-gold-soft"
            >
              Bedarf schildern
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <a
              href={business.phone.href}
              className="inline-flex items-center gap-2 rounded-sm border border-white/35 px-6 py-3.5 font-display text-sm font-bold text-white transition-colors hover:border-gold"
            >
              {business.phone.display}
            </a>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Für wen"
            title="Objekte, die wir betreuen"
            lead="Der Aufwand unterscheidet sich je nach Objektart deutlich — deshalb fragen wir ihn ab, statt zu schätzen."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {objektarten.map((o) => (
              <div key={o.titel} className="rounded-sm border border-mist bg-surface p-6">
                <o.icon className="size-6 text-gold-deep" aria-hidden />
                <h3 className="mt-4 font-display text-lg text-navy">{o.titel}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{o.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-mist/40 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Leistungen"
            title="Was wir für Geschäftskunden übernehmen"
            lead="Von einzelnen Dienstleistungen bis zur umfassenden Objektbetreuung – individuell auf Ihr Objekt und Ihren Bedarf abgestimmt."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.slug} className="rounded-sm border border-mist bg-surface p-6">
                <h3 className="font-display text-lg text-navy">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {s.businessTeaser}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Zusammenarbeit"
            title="Wie wir arbeiten"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {arbeitsweise.map((a) => (
              <div key={a.titel} className="rounded-sm border border-mist bg-surface p-6">
                <a.icon className="size-6 text-gold-deep" aria-hidden />
                <h3 className="mt-4 font-display text-lg text-navy">{a.titel}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{a.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="bedarf" className="scroll-mt-20 bg-mist/40 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Anfrage"
            title="Schildern Sie uns Ihren Bedarf"
            lead="Je genauer die Angaben, desto belastbarer das Angebot. Wenn Sie etwas nicht wissen, lassen Sie es leer — wir klären es bei der Begehung."
          />
          <div className="mt-12 max-w-3xl rounded-sm border border-mist bg-surface p-6 sm:p-8">
            <B2bForm />
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Fragen" title="Was Geschäftskunden meistens fragen" />
          <div className="mt-10 max-w-3xl">
            <FaqList faqs={b2bFaqs} />
          </div>
        </Container>
      </section>

      <section className="border-t border-mist py-12">
        <Container>
          <p className="text-sm text-ink-muted">
            Sie fragen für Ihren Privathaushalt an?{" "}
            <Link
              href="/privatkunden#richtpreis"
              className="font-semibold text-navy underline"
            >
              Zur Preisschätzung
            </Link>{" "}
            — dort sehen Sie den Rahmen sofort, ohne Ihre Daten zu hinterlassen.
          </p>
        </Container>
      </section>
    </>
  );
}
