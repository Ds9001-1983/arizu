import type { Metadata } from "next";
import {
  BadgeEuro,
  Handshake,
  Leaf,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/site/container";
import { HeroMedia } from "@/components/site/hero-media";
import { KundenartWeiche } from "@/components/site/kundenart-weiche";
import { SectionHeading } from "@/components/site/section-heading";
import { TrustBar } from "@/components/site/trust-bar";
import { business } from "@/lib/business";
import { localBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  description:
    "Gebäudereinigung, Gartenpflege, Objektbetreuung und Entrümpelung für " +
    "Privat- und Geschäftskunden in Elmshorn, im Kreis Pinneberg und im Umkreis von 40 km.",
  alternates: { canonical: "/" },
};

/* „Warum ARIZU?" — vier Werte aus dem Entwurf, zwei Ergänzungen aus Arians
   Website-Review vom 17.08.2026. */
const reasons = [
  { icon: ShieldCheck, title: "Zuverlässig", text: "Wir halten, was wir versprechen." },
  { icon: Sparkles, title: "Qualität", text: "Höchste Standards bei jeder Leistung." },
  { icon: Scale, title: "Fair", text: "Transparente Preise und ehrliche Beratung." },
  { icon: Leaf, title: "Nachhaltig", text: "Wir denken heute an morgen." },
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

export default function Home() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />

      {/* Minimaler Einstieg: Positionierung und Leistungsversprechen, danach
          sofort die Entscheidung zwischen Privat- und Geschäftskunden. */}
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
            <h1 className="font-display text-[2.7rem] font-extrabold leading-[0.98] text-white sm:text-6xl lg:text-[4.4rem]">
              Alles aus
              <br />
              einer Hand.
            </h1>

            <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-white/85">
              {business.intro}
            </p>
          </div>
        </Container>
      </section>

      <KundenartWeiche />
      <TrustBar />

      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <SectionHeading
              eyebrow="Warum ARIZU?"
              title="Wofür wir stehen"
              lead="ARIZU ist ein junger Betrieb — und genau deshalb bekommen Sie hier noch den Inhaber selbst am Telefon, nicht die dritte Ebene einer Verwaltung."
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
    </>
  );
}
