import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Handshake,
  Leaf,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Scale,
  ShieldCheck,
  Snowflake,
  Sparkles,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-section";
import { HeroMedia } from "@/components/site/hero-media";
import { KundenartWeiche } from "@/components/site/kundenart-weiche";
import { ObjektartenGrid } from "@/components/site/objektarten";
import { ProcessTimeline } from "@/components/site/process-timeline";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceGrid } from "@/components/site/service-grid";
import { business, serviceArea, whatsappHref } from "@/lib/business";
import { faqSchema, HOME_TITLE, pageMetadata } from "@/lib/seo";
import type { Faq } from "@/lib/services";

/* ==================================================================
   Startseite als Übersicht (seit 04.11.2026).

   Bis dahin war sie auf Arians Wunsch vom 14.08.2026 minimal: Hero, Weiche,
   „Warum ARIZU“. Laut Search Console landeten in drei Monaten 58 von 63
   Google-Klicks hier, die Leistungsseiten bekamen keinen einzigen — von der
   Startseite führte auch kein Link dorthin. Dennis und Arian haben deshalb am
   03.11.2026 entschieden: Die Startseite zeigt alle Leistungen und führt von
   dort in den Privat- oder Geschäftskundenbereich. Beide Bereiche bleiben.

   Bewusst NICHT hier: Konfigurator und Formulare. Sie liegen in den
   Bereichen und auf /kontakt und würden das Client-JS der Einstiegsseite
   vergrößern.
   ================================================================== */

const description =
  "Hausmeisterservice, Gebäudereinigung, Winterdienst, Gartenpflege und " +
  "Entrümpelung für Unternehmen, Hausverwaltungen und Privatkunden in " +
  `${serviceArea.center}, ${serviceArea.region} und Hamburg.`;

/* `absolute`, weil das Template des Root-Layouts nur für Unterseiten gilt,
   nicht für die Seite im selben Segment — ohne würde „| ARIZU“ fehlen.
   Der Rest kommt aus pageMetadata(), damit auch die Startseite das
   OG-Bild trägt. Das LocalBusiness-JSON-LD steht seit 24.09.2026 im
   Root-Layout und damit auch hier. */
const basis = pageMetadata({ title: HOME_TITLE, description, path: "/" });
export const metadata: Metadata = { ...basis, title: { absolute: HOME_TITLE } };

/* „Warum ARIZU?" — vier Werte aus dem Entwurf, zwei Ergänzungen aus Arians
   Website-Review vom 17.08.2026. */
const reasons = [
  {
    icon: ShieldCheck,
    title: "Zuverlässig",
    text: "Pünktlich und vertrauensvoll: Wir halten, was wir versprechen.",
  },
  {
    icon: Sparkles,
    title: "Kompetent",
    text: "Ein erfahrenes Team mit höchsten Standards bei jeder Leistung.",
  },
  { icon: Scale, title: "Fair", text: "Transparente Preise und ehrliche Beratung." },
  {
    icon: Leaf,
    title: "Nachhaltig",
    text: "Umweltbewusst handeln: Wir denken heute an morgen.",
  },
  {
    icon: Handshake,
    title: "Partnerschaftlich",
    text: "Ein fester Ansprechpartner, der Ihr Objekt kennt.",
  },
  {
    icon: RefreshCw,
    title: "Flexibel",
    text: "Wenn kurzfristig etwas anfällt, finden wir eine Lösung.",
  },
];

/* Fragen zur Firma als Ganzes. Keine davon steht auf /privatkunden,
   /geschaeftskunden oder einer Leistungsseite: Dieselbe Frage zweimal als
   FAQPage auszuzeichnen schadet mehr als es nützt. Alle Antworten stützen
   sich auf Aussagen, die an anderer Stelle schon abgestimmt sind
   (Besichtigung, Rückmeldung am selben Werktag, Einsatzgebiet). */
const homeFaqs: Faq[] = [
  {
    question: "Arbeiten Sie für Privatkunden und für Unternehmen?",
    answer:
      "Ja. Wir arbeiten für Privathaushalte, Eigentümer, Hausverwaltungen und " +
      "Unternehmen. Privatkunden sehen für Reinigung, Gartenpflege und " +
      "Entrümpelung vorab online einen Preisrahmen. Geschäftskunden bekommen " +
      "ein Angebot nach einer kostenlosen Begehung.",
  },
  {
    question: "Übernehmen Sie mehrere Leistungen für dasselbe Objekt?",
    answer:
      "Ja, das ist der Kern unseres Angebots: Reinigung, Hausmeisterservice, " +
      "Winterdienst, Grünpflege und Entrümpelung aus einer Hand, mit einem " +
      "festen Ansprechpartner. Sie müssen keine Gewerke einzeln koordinieren.",
  },
  {
    question: "In welchen Orten sind Sie im Einsatz?",
    answer:
      `Wir arbeiten in ${serviceArea.label} sowie im Umkreis von ` +
      `${serviceArea.radiusKm} km um ${serviceArea.center}, regelmäßig in ` +
      `${serviceArea.cities.join(", ")}. Bei größeren Aufträgen fahren wir ` +
      "auch darüber hinaus.",
  },
  {
    question: "Ist die Besichtigung vor Ort kostenlos?",
    answer:
      "Ja, die Besichtigung ist kostenlos und unverbindlich. Danach " +
      "bekommen Sie ein Angebot, das zu Ihrem Objekt und Ihrem Bedarf passt.",
  },
  {
    question: "Wie schnell melden Sie sich nach einer Anfrage?",
    answer:
      "In der Regel noch am selben Werktag. Am schnellsten erreichen Sie uns " +
      `telefonisch unter ${business.phone.display} oder per WhatsApp.`,
  },
];

export default function Home() {
  return (
    <>
      <JsonLd data={faqSchema(homeFaqs)} />

      <section className="relative isolate flex min-h-[clamp(34rem,80svh,44rem)] items-end overflow-hidden mt-[calc(var(--header-h)*-1)]">
        <HeroMedia
          assetId="img-hero"
          alt="Modernes Mehrfamilienhaus mit gepflegtem Weg und geschnittenen Hecken"
          poster="/images/hero-gebaeude.webp"
          posterMobile="/images/hero-gebaeude-mobil.webp"
          video="/video/hero-gebaeude.mp4"
          videoMobile="/video/hero-gebaeude-mobil.mp4"
        />

        <Container wide className="relative z-10 pt-32 pb-14 sm:pb-20">
          <div className="max-w-2xl">
            {/* Die Dachzeile gehört zur H1: Der Slogan allein sagt Google
                nicht, was ARIZU macht und wo. Sichtbar statt sr-only, damit
                Sehende und Screenreader dieselbe Überschrift bekommen.
                Wieder aufgenommen am 24.09.2026 (SEO-Handoff), nachdem sie
                am 17.08. als separate Zeile entfallen war. */}
            <h1 className="font-display text-[2.7rem] font-extrabold leading-[0.98] text-white sm:text-6xl lg:text-[4.4rem]">
              {/* Der Schatten dunkelt das Bild direkt hinter der kleinen
                  Schrift ab: Auf 360 und 1024 px liegt die Zeile teils vor der
                  hellen Fassade, dort fiel der Kontrast ohne ihn auf 2,7:1. */}
              <span className="mb-5 block font-sans text-[0.68rem] font-semibold uppercase leading-normal tracking-[0.24em] text-gold-soft [text-shadow:0_0_12px_rgb(6_15_28),0_0_4px_rgb(6_15_28/0.95),0_1px_2px_rgb(6_15_28)]">
                Gebäudedienstleistungen in {serviceArea.center} &amp;{" "}
                {serviceArea.region}
              </span>
              Alles aus
              <br />
              einer Hand.
            </h1>

            <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-white/85">
              {business.intro}
            </p>

            {/* Keine Telefonnummer im Hero (Absprache vom 14.08.2026): Sie
                steht dauerhaft im Header. Der Hero führt zu den Leistungen. */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#leistungen"
                className="inline-flex items-center gap-2 rounded-sm bg-white px-6 py-3.5 font-display text-sm font-bold text-navy transition-colors hover:bg-white/85"
              >
                Leistungen ansehen
                <ArrowRight className="size-4" aria-hidden />
              </a>
              <Link
                href="/kontakt#anfrage"
                className="inline-flex items-center gap-2 rounded-sm border border-white/40 bg-white/10 px-6 py-3.5 font-display text-sm font-bold text-white backdrop-blur-md transition-colors hover:border-white/80 hover:bg-white/20"
              >
                Anfrage stellen
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------- Leistungen */}
      <section id="leistungen" className="scroll-mt-20 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Leistungen"
            title="Was wir für Ihre Immobilie übernehmen"
            lead="Hausmeisterservice, Gebäudereinigung, Grünpflege und Entrümpelung für Wohnungen, Häuser, Wohnanlagen und Gewerbeobjekte. Jede Leistung einzeln oder alles zusammen, mit einem festen Ansprechpartner."
          />
          <div className="mt-12">
            <ServiceGrid variant="uebersicht" />
          </div>

          {/* Winterdienst ist keine eigene Leistung, sondern Teil des
              Hausmeisterservice. Er steht trotzdem sichtbar auf der
              Startseite, weil Hausverwaltungen ab November danach suchen. */}
          <div className="mt-5 flex flex-col gap-5 rounded-sm border border-navy/15 bg-navy/4 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <Snowflake className="mt-0.5 size-7 shrink-0 text-gold-deep" strokeWidth={1.5} aria-hidden />
              <div>
                <h3 className="font-display text-lg text-navy">
                  Winterdienst für Wohnanlagen und Gewerbe
                </h3>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
                  Wir übernehmen die Räum- und Streupflicht für Ihr Objekt, als
                  Teil des Hausmeisterservice oder als Zusatzmodul. Abgerechnet
                  wird saisonal, im Sommer fällt kein Anteil an.
                </p>
              </div>
            </div>
            <Link
              href="/leistungen/objektbetreuung#winterdienst"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gold-deep hover:text-navy"
            >
              Mehr zum Winterdienst
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      <KundenartWeiche />

      {/* ------------------------------------------------------ Objektarten */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Für Geschäftskunden"
            title="Objekte, die wir betreuen"
            lead="Vom Büro bis zur Wohnanlage: Wir stimmen Turnus, Zeiten und Umfang auf Ihr Objekt ab. Das Angebot gibt es nach einer kostenlosen Begehung."
          />
          <ObjektartenGrid className="mt-12 lg:grid-cols-3" />
          <Link
            href="/geschaeftskunden"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:text-navy"
          >
            Zum Geschäftskundenbereich
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Warum */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <SectionHeading
              eyebrow={`Warum ${business.shortName}?`}
              title="Ein Ansprechpartner. Klare Lösungen. Verlässliche Leistung."
              lead={`Wir denken mit, packen an und übernehmen Verantwortung. Ob Gebäudereinigung, Grün- und Außenanlagenpflege, Entrümpelung und Auflösung oder eine umfassende Objektbetreuung – ${business.shortName} steht für professionelle Dienstleistungen aus einer Hand, persönliche Betreuung und verlässliche Ergebnisse.`}
            />
            <div>
              <h2 className="mb-6 font-display text-2xl text-navy">Wofür wir stehen</h2>
              <ul className="grid gap-px overflow-hidden rounded-sm border border-mist bg-mist sm:grid-cols-2">
                {reasons.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="bg-surface p-7">
                    <Icon className="size-7 text-gold" strokeWidth={1.5} aria-hidden />
                    <h3 className="mt-4 font-display text-base font-bold uppercase tracking-[0.1em] text-navy">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <ProcessTimeline />

      {/* ------------------------------------------------- Gebiet und FAQ */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="rounded-sm border border-mist bg-surface p-7 sm:p-9">
            <h2 className="flex items-center gap-3 font-display text-xl text-navy">
              <MapPin className="size-6 shrink-0 text-gold-deep" aria-hidden />
              Im Einsatz in {serviceArea.center}, {serviceArea.region} und Hamburg
            </h2>
            <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-ink-muted">
              Unser Sitz ist in {serviceArea.center}. Wir arbeiten im Umkreis von{" "}
              {serviceArea.radiusKm} km, regelmäßig in diesen Orten:
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {serviceArea.cities.map((city) => (
                <li
                  key={city}
                  className="rounded-full border border-mist bg-shell px-3.5 py-1.5 text-sm text-navy"
                >
                  {city}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-20">
            <SectionHeading eyebrow="Häufige Fragen" title={`Fragen an ${business.shortName}`} />
            <div className="mt-10 max-w-3xl">
              <FaqList faqs={homeFaqs} />
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------- Abschluss */}
      {/* Hell statt Navy-Band (Arians Wunsch vom 04.11.2026): Der Footer
          darunter ist bereits Navy, zwei dunkle Flächen hintereinander
          wirkten schwer. Der goldene Strich oben ist der einzige Akzent. */}
      <section className="pb-20 sm:pb-24">
        <Container>
          <div className="flex flex-col gap-8 rounded-sm border border-mist border-t-2 border-t-gold bg-surface p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl text-navy sm:text-4xl">
                Sprechen Sie mit uns über Ihr Objekt
              </h2>
              <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-muted">
                Die Besichtigung vor Ort ist kostenlos und unverbindlich. Wir
                melden uns in der Regel noch am selben Werktag.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={business.phone.href}
                className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 font-display text-sm font-bold text-white transition-colors hover:bg-navy-band"
              >
                <Phone className="size-4" aria-hidden />
                {business.phone.display}
              </a>
              {business.whatsappEnabled && (
                <a
                  href={whatsappHref(
                    `Hallo ${business.shortName}, ich habe eine Anfrage:`,
                  )}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-sm border border-navy/20 bg-white px-6 py-3.5 font-display text-sm font-bold text-navy transition-colors hover:border-navy"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </a>
              )}
              <Link
                href="/kontakt#anfrage"
                className="inline-flex items-center gap-2 rounded-sm border border-navy/20 bg-white px-6 py-3.5 font-display text-sm font-bold text-navy transition-colors hover:border-navy"
              >
                Anfrage stellen
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
