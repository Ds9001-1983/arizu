import type { Metadata } from "next";
import {
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
import { business, serviceArea, SITE_URL } from "@/lib/business";
import { localBusinessSchema } from "@/lib/seo";

const description =
  "Gebäudereinigung, Gartenpflege, Entrümpelung und Objektbetreuung für " +
  `Privat- und Geschäftskunden in ${serviceArea.center}, ` +
  `${serviceArea.region} und Hamburg.`;

export const metadata: Metadata = {
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: `${business.shortName} Gebäudedienstleistungen`,
    title: `Gebäudedienstleistungen in ${business.address.city} — ${business.shortName}`,
    description,
    url: SITE_URL,
  },
};

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
    </>
  );
}
