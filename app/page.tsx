import Link from "next/link";
import { ArrowRight, BadgeEuro, Handshake, Leaf, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { AiMedia } from "@/components/ai/ai-media";
import { JsonLd } from "@/components/seo/json-ld";
import { AnfrageSection } from "@/components/site/anfrage-section";
import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-section";
import { KonfiguratorTabs } from "@/components/site/konfigurator-tabs";
import { LogoIcon } from "@/components/site/logo";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceGrid } from "@/components/site/service-grid";
import { TrustBar } from "@/components/site/trust-bar";
import { business, serviceArea } from "@/lib/business";
import { faqSchema, localBusinessSchema } from "@/lib/seo";
import { services } from "@/lib/services";

/* „Warum ARIZU?" — Wortlaut aus dem Designentwurf. */
const reasons = [
  { icon: ShieldCheck, title: "Zuverlässig", text: "Wir halten, was wir versprechen." },
  { icon: Sparkles, title: "Qualität", text: "Höchste Standards bei jeder Leistung." },
  { icon: Handshake, title: "Fair", text: "Transparente Preise und ehrliche Beratung." },
  { icon: Leaf, title: "Nachhaltig", text: "Wir denken heute an morgen." },
];

/* Je Leistung die stärkste Frage auf die Startseite — der Rest steht auf den
   Detailseiten. Hält das FAQPage-Schema hier schlank und vermeidet, dass
   dieselbe Frage doppelt ausgezeichnet wird. */
const homeFaqs = services.map((s) => s.faqs[0]);

export default function Home() {
  return (
    <>
      <JsonLd data={[localBusinessSchema(), faqSchema(homeFaqs)]} />

      {/* ------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-shell pt-10 pb-0 sm:pt-16">
        <Container wide>
          <div className="grid items-stretch gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="max-w-2xl py-8 lg:py-16">
              <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-deep">
                Gebäudedienstleistungen · {business.address.city}{" & "}Kreis Pinneberg
              </p>

              <h1 className="mt-5 font-display text-[2.6rem] font-extrabold leading-[0.98] text-navy sm:text-6xl lg:text-[4.2rem]">
                Alles aus
                <br />
                einer Hand.
              </h1>

              <p className="mt-5 font-display text-lg font-bold text-gold-deep">
                {business.subclaim}
              </p>

              <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-ink-muted">
                {business.intro}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="#richtpreis"
                  className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-4 font-display text-sm font-bold text-white transition-colors hover:bg-navy-band"
                >
                  Richtpreis in 60 Sekunden
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <a
                  href={business.phone.href}
                  className="inline-flex items-center gap-2 rounded-sm border border-navy/20 px-6 py-4 font-display text-sm font-bold text-navy transition-colors hover:border-gold hover:text-gold-deep"
                >
                  <Phone className="size-4" aria-hidden />
                  {business.phone.display}
                </a>
              </div>

              <p className="mt-6 text-sm text-ink-muted">
                Besichtigung und Angebot kostenlos · Antwort in der Regel am
                selben Werktag
              </p>
            </div>

            {/* Rechte Bühne: läuft absichtlich in den Seitenrand hinein und
                bricht damit das mittige „Headline + Button"-Schema auf.
                Das Dach-Z aus dem Logo dient als Bildmarke im Großformat. */}
            <div className="relative -mr-5 min-h-[26rem] overflow-hidden rounded-tl-sm bg-navy sm:-mr-8 lg:mr-[calc(50%-50vw)]">
              <AiMedia
                assetId="img-hero"
                className="absolute inset-0 rounded-none"
                badgePosition="top-left"
              >
                {/* Bewusst <picture> statt next/image: Der Optimizer ist
                    projektweit aus (er würde die KI-Metadaten strippen) und
                    erzeugt damit auch kein srcSet. Ohne Mobilvariante lud das
                    Handy die 162-KB-Desktopdatei und verdrängte dabei die
                    Fontdateien — gemessen: LCP 3,9 s, obwohl das LCP-Element
                    ein Textabsatz ist. Die 62-KB-Variante löst das Rennen auf. */}
                <picture>
                  <source
                    media="(max-width: 640px)"
                    srcSet="/images/hero-gebaeude-mobil.webp"
                    width={800}
                    height={448}
                  />
                  <img
                    src="/images/hero-gebaeude.webp"
                    alt="Modernes Mehrfamilienhaus mit gepflegtem Weg und geschnittenen Hecken"
                    width={1344}
                    height={752}
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </picture>
                {/* Navy-Verlauf von unten: hält die Liste lesbar, ohne das
                    Motiv zuzudecken. Reine Deckfläche würde das Bild entwerten. */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/25"
                  aria-hidden
                />
              </AiMedia>

              <LogoIcon
                className="pointer-events-none absolute -right-16 -top-10 h-[130%] w-auto opacity-[0.08] [--logo-accent:#ffffff] [--logo-ink:transparent]"
                label=""
              />
              <div className="relative flex h-full min-h-[26rem] flex-col justify-end gap-8 p-8 sm:p-12">
                <ul className="space-y-5">
                  {[
                    "Preis online sehen, bevor Sie anrufen",
                    "Ein Ansprechpartner für Reinigung, Garten, Objekt und Räumung",
                    `Im Einsatz in ${serviceArea.cities.slice(0, 4).join(", ")} und Umgebung`,
                  ].map((line) => (
                    <li key={line} className="flex gap-3.5 text-white">
                      <span
                        className="mt-2 size-2 shrink-0 rotate-45 bg-gold"
                        aria-hidden
                      />
                      <span className="text-[1.05rem] leading-snug">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <TrustBar />

      {/* -------------------------------------------------------- Leistungen */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Unsere Dienstleistungen"
            title="Vier Bereiche, ein Ansprechpartner"
            lead="Von der wöchentlichen Treppenhausreinigung bis zur kompletten Wohnungsauflösung — Sie müssen nicht vier Firmen koordinieren."
          />
          <div className="mt-12">
            <ServiceGrid />
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ Konfigurator */}
      <section id="richtpreis" className="scroll-mt-20 bg-mist/40 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Richtpreis in 60 Sekunden"
            title="Was kostet das? Sehen Sie selbst."
            lead="Andere schreiben „Angebot in 60 Sekunden“ und schicken Ihnen dann ein Formular. Hier bekommen Sie eine Zahl — sofort, ohne Ihre Daten abzugeben."
          />
          <div className="mt-12">
            <KonfiguratorTabs />
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------------- Warum wir */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <SectionHeading
              eyebrow="Warum ARIZU?"
              title="Wofür wir stehen"
              lead="ARIZU ist ein junger Betrieb — und genau deshalb bekommen Sie hier noch den Inhaber selbst an den Telefon, nicht die dritte Ebene einer Verwaltung."
            />
            <ul className="grid gap-px overflow-hidden rounded-sm border border-mist bg-mist sm:grid-cols-2">
              {reasons.map(({ icon: Icon, title, text }) => (
                <li key={title} className="bg-surface p-7">
                  <Icon className="size-7 text-gold" strokeWidth={1.5} aria-hidden />
                  <h3 className="mt-4 font-display text-base font-bold uppercase tracking-[0.1em] text-navy">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------- Steuerlicher Vorteil */}
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
                Reinigung, Gartenpflege und Hausmeisterleistungen im Privathaushalt
                gelten als haushaltsnahe Dienstleistungen. Sie können 20 % der
                Arbeitskosten von der Steuer absetzen, bis zu 4.000 € im Jahr
                (§ 35a EStG). Voraussetzung: eine Rechnung und Zahlung per
                Überweisung — Barzahlung erkennt das Finanzamt nicht an. Wir weisen
                den Arbeitslohn auf jeder Rechnung getrennt aus, damit Sie den
                Betrag direkt eintragen können.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------------------- FAQ */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Häufige Fragen"
            title="Was Kunden zuerst wissen wollen"
          />
          <div className="mt-10">
            <FaqList faqs={homeFaqs} />
          </div>
        </Container>
      </section>

      <AnfrageSection />
    </>
  );
}
