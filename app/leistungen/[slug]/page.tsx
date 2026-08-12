import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Phone } from "lucide-react";
import { AiMedia } from "@/components/ai/ai-media";
import { JsonLd } from "@/components/seo/json-ld";
import { AnfrageSection } from "@/components/site/anfrage-section";
import { Container } from "@/components/site/container";
import { FaqList } from "@/components/site/faq-section";
import { Konfigurator } from "@/components/site/konfigurator";
import { SectionHeading } from "@/components/site/section-heading";
import { business, serviceArea } from "@/lib/business";
import { getConfigurator } from "@/lib/pricing";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/seo";
import { getService, services } from "@/lib/services";

/* Alle vier Seiten sind statisch — es gibt keine dynamischen Slugs. */
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.seo.title,
    description: service.seo.description,
    alternates: { canonical: `/leistungen/${service.slug}` },
    openGraph: {
      title: service.seo.title,
      description: service.seo.description,
      url: `/leistungen/${service.slug}`,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  const spec = getConfigurator(slug);
  if (!service || !spec) notFound();

  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <JsonLd
        data={[
          serviceSchema(service),
          faqSchema(service.faqs),
          breadcrumbSchema([
            { name: "Start", path: "/" },
            { name: service.name, path: `/leistungen/${service.slug}` },
          ]),
        ]}
      />

      {/* ------------------------------------------------------------- Kopf */}
      <section className="bg-shell pt-8 pb-16 sm:pt-12">
        <Container>
          <nav aria-label="Brotkrumen" className="text-xs text-ink-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-navy">
                  Start
                </Link>
              </li>
              <li aria-hidden className="text-gold">
                /
              </li>
              <li className="text-navy">{service.name}</li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h1 className="font-display text-[2.2rem] font-extrabold leading-[1.03] text-navy sm:text-5xl">
                {service.heading}
              </h1>
              <p className="mt-5 font-display text-lg font-bold text-gold-deep">
                {service.teaser}
              </p>
              <p className="mt-6 text-[1.05rem] leading-relaxed text-ink-muted">
                {service.body}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#rechner"
                  className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 font-display text-sm font-bold text-white transition-colors hover:bg-navy-band"
                >
                  Richtpreis berechnen
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <a
                  href={business.phone.href}
                  className="inline-flex items-center gap-2 rounded-sm border border-navy/20 px-6 py-3.5 font-display text-sm font-bold text-navy transition-colors hover:border-gold hover:text-gold-deep"
                >
                  <Phone className="size-4" aria-hidden />
                  {business.phone.display}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <AiMedia
                assetId={service.image.assetId}
                className="rounded-sm border border-mist"
              >
                <Image
                  src={service.image.src}
                  alt={service.image.alt}
                  width={service.image.width}
                  height={service.image.height}
                  priority
                  unoptimized
                  className="h-64 w-full object-cover sm:h-72"
                />
              </AiMedia>

              {/* Alle Einzelleistungen ausgeschrieben — für Kunden zum Prüfen,
                  für Suchmaschinen und KI-Systeme als vollständige Liste
                  dessen, was ARIZU in diesem Bereich abdeckt. */}
              <div className="rounded-sm border border-mist bg-surface p-7">
                <h2 className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-deep">
                  Einzeldienstleistungen
                </h2>
                <ul className="mt-5 space-y-3">
                  {service.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.95rem] text-navy">
                      <Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ Konfigurator */}
      <section id="rechner" className="scroll-mt-20 bg-mist/40 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Richtpreis in 60 Sekunden"
            title={`Was kostet ${service.name} bei Ihnen?`}
            lead="Sie geben vier Angaben ein und sehen sofort den Rahmen. Erst danach entscheiden Sie, ob Sie anfragen."
          />
          <div className="mt-12">
            <Konfigurator slug={service.slug} />
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- Gebiet */}
      <section className="py-16">
        <Container>
          <div className="rounded-sm border border-mist bg-surface p-7 sm:p-9">
            <h2 className="font-display text-xl text-navy">
              {service.name} in Ihrer Nähe
            </h2>
            <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-ink-muted">
              Wir arbeiten im Umkreis von {serviceArea.radiusKm} km um{" "}
              {serviceArea.center}. Regelmäßig im Einsatz sind wir in{" "}
              {serviceArea.cities.join(", ")}. Liegt Ihr Objekt weiter weg? Rufen
              Sie an — bei größeren Aufträgen fahren wir auch darüber hinaus.
            </p>
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------------------- FAQ */}
      <section className="pb-20 sm:pb-24">
        <Container>
          <SectionHeading eyebrow="Häufige Fragen" title={`Fragen zu ${service.name}`} />
          <div className="mt-10">
            <FaqList faqs={service.faqs} />
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------- Weitere Leistungen */}
      <section className="border-t border-mist bg-shell py-16">
        <Container>
          <h2 className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-deep">
            Weitere Leistungen
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/leistungen/${o.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-sm border border-mist bg-surface px-5 py-4 transition-colors hover:border-gold"
                >
                  <span className="font-display text-base font-bold text-navy">
                    {o.name}
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-gold transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <AnfrageSection defaultService={service.slug} />
    </>
  );
}
