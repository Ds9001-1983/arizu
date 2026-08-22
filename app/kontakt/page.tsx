import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { AiMedia } from "@/components/ai/ai-media";
import { AnfrageSection } from "@/components/site/anfrage-section";
import { Container } from "@/components/site/container";
import { ProcessTimeline } from "@/components/site/process-timeline";
import { SectionHeading } from "@/components/site/section-heading";
import { business, serviceArea, whatsappHref } from "@/lib/business";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Kontakt",
  description:
    `So erreichen Sie ${business.name}: Telefon, WhatsApp, E-Mail und ` +
    "Anfrageformular. Besichtigung und Angebot sind kostenlos.",
  path: "/kontakt",
});

export default function KontaktPage() {
  return (
    <>
      <section className="bg-shell pt-10 pb-16 sm:pt-14">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Kontakt"
            title="Kurzer Weg, schnelle Antwort"
            lead="Telefonisch, per WhatsApp oder über unser Kontaktformular – wählen Sie den Weg, der für Sie am einfachsten ist. Wenn wir gerade nicht erreichbar sind, melden wir uns selbstverständlich zeitnah bei Ihnen."
          />

          <div className="mt-12 overflow-hidden rounded-sm border border-mist bg-surface lg:grid lg:grid-cols-[minmax(18rem,0.78fr)_1.42fr]">
            <div className="border-b border-mist lg:border-r lg:border-b-0">
              <AiMedia assetId="img-arian-portrait-v3" badgePosition="top-right">
                <Image
                  src="/images/arian-aslani-v4.webp"
                  alt={`${business.owner}, Inhaber von ${business.name}`}
                  width={1122}
                  height={1402}
                  unoptimized
                  className="aspect-[4/5] w-full object-cover object-top"
                />
              </AiMedia>
              <div className="p-6 sm:p-8">
                <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                  Ihr Ansprechpartner
                </p>
                <h2 className="mt-2 font-display text-xl text-navy">
                  {business.owner}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Inhaber und persönlicher Ansprechpartner für Ihre Anfrage.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div>
                <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                  Direkt erreichen
                </p>
                <h2 className="mt-2 font-display text-2xl text-navy">
                  Wie dürfen wir helfen?
                </h2>
              </div>

              <div className="mt-6 divide-y divide-mist border-y border-mist">
                {[
                  {
                    icon: Phone,
                    title: "Festnetz",
                    value: business.phone.display,
                    href: business.phone.href,
                    hint: "Für ein direktes Gespräch oder einen Rückruf",
                    external: false,
                  },
                  {
                    icon: MessageCircle,
                    title: "WhatsApp",
                    value: "Fotos vom Objekt senden",
                    href: whatsappHref(
                      `Hallo ${business.shortName}, ich habe eine Anfrage:`,
                    ),
                    hint: "Praktisch für Keller, Garten oder Wohnung",
                    external: true,
                  },
                  {
                    icon: Mail,
                    title: "E-Mail",
                    value: business.email,
                    href: `mailto:${business.email}`,
                    hint: "In der Regel Antwort am selben Werktag",
                    external: false,
                  },
                ].map((c) => (
                  <a
                    key={c.title}
                    href={c.href}
                    target={c.external ? "_blank" : undefined}
                    rel={c.external ? "noopener" : undefined}
                    className="group flex items-start gap-4 py-5"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-deep transition-colors group-hover:bg-gold group-hover:text-navy">
                      <c.icon className="size-5" strokeWidth={1.7} aria-hidden />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block font-sans text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                        {c.title}
                      </span>
                      <span className="mt-1 block font-display text-base font-bold break-words text-navy group-hover:text-gold-deep">
                        {c.value}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                        {c.hint}
                      </span>
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2.5 font-display text-base text-navy">
                    <MapPin className="size-5 text-gold" aria-hidden />
                    Anschrift &amp; Einsatzgebiet
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {business.name}
                    <br />
                    {business.address.street ? (
                      <>
                        {business.address.street}
                        <br />
                      </>
                    ) : null}
                    {business.address.postalCode} {business.address.city}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                    {serviceArea.label} sowie angrenzende Orte im Umkreis von{" "}
                    {serviceArea.radiusKm} km um {serviceArea.center}.
                  </p>
                </div>

                <div>
                  <h3 className="flex items-center gap-2.5 font-display text-base text-navy">
                    <Clock className="size-5 text-gold" aria-hidden />
                    Erreichbarkeit
                  </h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
                    {business.openingHours.map((h) => (
                      <li key={h.days.join()} className="flex justify-between gap-4">
                        <span>
                          {h.days.length > 1
                            ? `${h.days[0]}–${h.days[h.days.length - 1]}`
                            : h.days[0]}
                        </span>
                        <span className="tabular-nums">
                          {h.opens}–{h.closes} Uhr
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                    Außerhalb dieser Zeiten: Nachricht senden — wir melden uns am
                    nächsten Werktag.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <ProcessTimeline />
      <AnfrageSection kundenart="auswahl" />
    </>
  );
}
