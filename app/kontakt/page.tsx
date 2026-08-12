import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { AnfrageSection } from "@/components/site/anfrage-section";
import { Container } from "@/components/site/container";
import { SectionHeading } from "@/components/site/section-heading";
import { business, serviceArea } from "@/lib/business";

export const metadata: Metadata = {
  title: `Kontakt — ${business.shortName} ${business.address.city}`,
  description:
    `So erreichen Sie ${business.name}: Telefon, WhatsApp, E-Mail und ` +
    "Anfrageformular. Besichtigung und Angebot sind kostenlos.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <section className="bg-shell pt-10 pb-16 sm:pt-14">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Kontakt"
            title="Kurzer Weg, schnelle Antwort"
            lead="Am schnellsten geht es telefonisch — meist sind wir unterwegs, rufen aber zurück. Für Fotos vom Objekt ist WhatsApp der bequemste Weg."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Phone,
                title: "Mobil",
                value: business.phone.display,
                href: business.phone.href,
                hint: "Direkt beim Inhaber",
              },
              {
                icon: Phone,
                title: "Festnetz",
                value: business.landline.display,
                href: business.landline.href,
                hint: "Büro",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp",
                value: "Foto senden",
                href: business.whatsapp.hrefPrefilled,
                hint: "Keller, Garten, Wohnung zeigen",
              },
              {
                icon: Mail,
                title: "E-Mail",
                value: business.email,
                href: `mailto:${business.email}`,
                hint: "Antwort am selben Werktag",
              },
            ].map((c) => (
              <a
                key={c.title + c.value}
                href={c.href}
                className="group rounded-sm border border-mist bg-surface p-6 transition-colors hover:border-gold"
              >
                <c.icon className="size-6 text-gold" strokeWidth={1.5} aria-hidden />
                <p className="mt-4 font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  {c.title}
                </p>
                <p className="mt-1.5 font-display text-base font-bold break-words text-navy group-hover:text-gold-deep">
                  {c.value}
                </p>
                <p className="mt-2 text-xs text-ink-muted">{c.hint}</p>
              </a>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-sm border border-mist bg-surface p-6">
              <h2 className="flex items-center gap-2.5 font-display text-lg text-navy">
                <MapPin className="size-5 text-gold" aria-hidden />
                Anschrift
              </h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted">
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
                Wir arbeiten im Umkreis von {serviceArea.radiusKm} km um{" "}
                {serviceArea.center} — unter anderem in {serviceArea.cities.join(", ")}.
              </p>
            </div>

            <div className="rounded-sm border border-mist bg-surface p-6">
              <h2 className="flex items-center gap-2.5 font-display text-lg text-navy">
                <Clock className="size-5 text-gold" aria-hidden />
                Erreichbarkeit
              </h2>
              <ul className="mt-3 space-y-1.5 text-[0.95rem] text-ink-muted">
                {business.openingHours.map((h) => (
                  <li key={h.days.join()} className="flex justify-between gap-6">
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
                Außerhalb dieser Zeiten: Nachricht per WhatsApp oder Formular — wir
                melden uns am nächsten Werktag.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <AnfrageSection />
    </>
  );
}
