import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building,
  Building2,
  CalendarCheck,
  FileText,
  Store,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { B2bForm } from "@/components/site/b2b-form";
import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-section";
import { SectionHeading } from "@/components/site/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { business } from "@/lib/business";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";
import { services, type Faq } from "@/lib/services";

/* ==================================================================
   Geschäftskundenbereich.

   Bewusst eine eigenständige Route und KEINE fünfte Leistung — Begründung
   steht in lib/b2b.ts. Kein Konfigurator, kein Richtpreis: So im
   Kundengespräch vom 14.08.2026 verabredet.

   Ohne eigenes Bildmotiv, nur mit Icons. Ein neues fotorealistisches KI-Bild
   bräuchte einen story-spec-Eintrag, ein sichtbares Badge und
   EXIF-Metadaten (AGENTS.md) — für eine Seite, die von Sachlichkeit lebt,
   wäre das Aufwand ohne Gegenwert.
   ================================================================== */

export const metadata: Metadata = {
  title: `Geschäftskunden — Gebäudedienstleistungen für Unternehmen`,
  description:
    "Unterhaltsreinigung, Büro- und Praxisreinigung, Objektbetreuung und " +
    "Außenanlagen für Unternehmen, Praxen und Hausverwaltungen in Elmshorn " +
    "und Umgebung. Angebot nach kostenloser Begehung, monatlich kündbar.",
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
];

const arbeitsweise = [
  {
    icon: UserCheck,
    titel: "Ein Ansprechpartner",
    text: "Sie rufen nicht in einer Zentrale an, sondern beim Inhaber.",
  },
  {
    icon: CalendarCheck,
    titel: "Vertretung ist eingeplant",
    text: "Bei Krankheit und Urlaub steht Ersatz bereit — die Leistung fällt nicht aus.",
  },
  {
    icon: FileText,
    titel: "Nachvollziehbar abgerechnet",
    text: "Leistungsverzeichnis je Objekt, eine Sammelrechnung im Monat, monatlich kündbar.",
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
  {
    question: "Warum steht hier kein Preis?",
    answer:
      "Weil er bei mehreren Objekten von Dingen abhängt, die man sehen muss — " +
      "Bodenbeläge, Zugänge, Sanitäreinheiten, Publikumsverkehr. Für " +
      "Privathaushalte nennen wir online einen Richtpreis; im Gewerbe wäre " +
      "eine Zahl ohne Begehung eine Zahl, die später nicht hält.",
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

      <section className="bg-shell pt-10 pb-16 sm:pt-14">
        <Container>
          <nav aria-label="Brotkrumen" className="mb-8 text-sm text-ink-muted">
            <Link href="/" className="hover:text-navy">
              Start
            </Link>
            <span className="mx-2" aria-hidden>
              ›
            </span>
            <span className="text-navy">Geschäftskunden</span>
          </nav>

          <SectionHeading
            as="h1"
            eyebrow="Geschäftskunden"
            title="Gebäudedienstleistungen für Unternehmen und Verwaltungen"
            lead="Reinigung, Objektbetreuung und Außenanlagen für Büros, Praxen, Wohnanlagen und Ladenlokale in Elmshorn und Umgebung. Sie schildern den Bedarf, wir sehen uns die Objekte an, Sie bekommen ein schriftliches Angebot."
          />

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#bedarf"
              className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 font-display text-sm font-bold text-white transition-colors hover:bg-navy-band"
            >
              Bedarf schildern
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <a
              href={business.phone.href}
              className="inline-flex items-center gap-2 rounded-sm border border-mist px-6 py-3.5 font-display text-sm font-bold text-navy transition-colors hover:border-gold"
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
            lead="Dieselben vier Bereiche wie im Privatkundengeschäft, nur anders zugeschnitten — planbar, wiederkehrend und je Objekt abgerechnet."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.slug} className="rounded-sm border border-mist bg-surface p-6">
                <h3 className="font-display text-lg text-navy">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.teaser}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Unterhaltsreinigung sowie Büro- und Praxisreinigung kalkulieren wir
            ausschließlich hier — bei laufenden Aufträgen entscheiden Bodenbeläge,
            Sanitäreinheiten und Publikumsverkehr über den Aufwand, und die sieht
            man erst vor Ort.
          </p>
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
              Zum Richtpreisrechner
            </Link>{" "}
            — dort sehen Sie den Rahmen sofort, ohne Ihre Daten zu hinterlassen.
          </p>
        </Container>
      </section>
    </>
  );
}
