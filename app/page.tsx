import Link from "next/link";
import { ArrowRight, BadgeEuro, Handshake, Leaf, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { AnfrageSection } from "@/components/site/anfrage-section";
import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-section";
import { HeroMedia } from "@/components/site/hero-media";
import { KonfiguratorTabs } from "@/components/site/konfigurator-tabs";
import { KundenartWeiche } from "@/components/site/kundenart-weiche";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceGrid } from "@/components/site/service-grid";
import { TrustBar } from "@/components/site/trust-bar";
import { glassSurface } from "@/components/ai/ai-media-badge";
import { business } from "@/lib/business";
import { getAllRates } from "@/lib/rates-server";
import { faqSchema, localBusinessSchema } from "@/lib/seo";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

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

/* Ein Tag. Die Preise ändert Arian vielleicht dreimal im Jahr, und die
   Speichern-Aktion frischt die Seite ohnehin sofort auf — das hier ist nur
   das Netz für den Fall, dass eine Invalidierung einmal danebengeht. Ohne
   das stünde dann bis zum nächsten Deploy ein falscher Verbraucherpreis auf
   der Seite, und niemand merkte es. */
export const revalidate = 86_400;

export default async function Home() {
  const rates = await getAllRates();

  return (
    <>
      <JsonLd data={[localBusinessSchema(), faqSchema(homeFaqs)]} />

      {/* ------------------------------------------------------------- Hero */}
      {/* Vollflächig statt geteilter Bühne: Mit Bewegtbild wirkt ein
          Split-Layout zerrissen, und das Gebäude ist das Verkaufsargument —
          es soll die ganze Breite bekommen. Der Text sitzt links unten im
          dunkelsten Teil des Verlaufs. */}
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
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-soft">
              Gebäudedienstleistungen · {business.address.city}{" & "}Kreis Pinneberg
            </p>

            <h1 className="mt-5 font-display text-[2.7rem] font-extrabold leading-[0.98] text-white sm:text-6xl lg:text-[4.4rem]">
              Alles aus
              <br />
              einer Hand.
            </h1>

            <p className="mt-5 font-display text-lg font-bold text-gold-soft">
              {business.subclaim}
            </p>

            <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-white/80">
              {business.intro}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="#richtpreis"
                className="inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-4 font-display text-sm font-bold text-navy transition-colors hover:bg-gold-soft"
              >
                Richtpreis in 60 Sekunden
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              {/* Dieselbe Glasoptik wie beim KI-Hinweis — auf dem Bewegtbild
                  trägt eine Glasfläche besser als ein flacher Rahmen. */}
              <a
                href={business.phone.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-sm px-6 py-4 font-display text-sm font-bold text-white transition-colors hover:text-gold-soft",
                  glassSurface,
                )}
              >
                <Phone className="size-4" aria-hidden />
                {business.phone.display}
              </a>
            </div>

            <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
              <span className="size-2 rotate-45 bg-gold" aria-hidden />
              Preis online sehen, bevor Sie anrufen — Besichtigung und Angebot
              kostenlos
            </p>
          </div>
        </Container>
      </section>

      <KundenartWeiche />

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
            <KonfiguratorTabs rates={rates} />
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
