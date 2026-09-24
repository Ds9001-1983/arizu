import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Container } from "@/components/site/container";
import { SectionHeading } from "@/components/site/section-heading";
import { business } from "@/lib/business";

/* Eigene 404-Seite, weil der Next-Default zwei Fehler hatte: englischer Titel
   („404: This page could not be found.“) und — über das Root-Layout geerbt —
   ein Canonical auf die Startseite. Jetzt: deutscher Titel, kein Canonical.
   Next setzt bei Status 404 ohnehin noindex; das `robots` hier ersetzt nur
   das geerbte „index, follow“, damit nicht zwei widersprüchliche
   robots-Angaben im Kopf stehen. Das ist keine Indexsperre für echte Seiten. */
export const metadata: Metadata = {
  title: { absolute: `Seite nicht gefunden | ${business.shortName} ${business.address.city}` },
  robots: { index: false, follow: true },
};

const links = [
  { href: "/privatkunden", label: "Für Privatkunden" },
  { href: "/geschaeftskunden", label: "Für Geschäftskunden" },
  { href: "/kontakt", label: "Kontakt aufnehmen" },
];

export default function NotFound() {
  return (
    <section className="bg-shell pt-10 pb-20 sm:pt-14 sm:pb-24">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Fehler 404"
          title="Diese Seite gibt es nicht"
          lead="Vielleicht hat sich die Adresse geändert, oder der Link war fehlerhaft. Von hier aus finden Sie weiter:"
        />

        <ul className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group flex items-center justify-between gap-4 rounded-sm border border-mist bg-surface px-5 py-4 transition-colors hover:border-gold"
              >
                <span className="font-display text-base font-bold text-navy">
                  {l.label}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-gold transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[0.95rem] leading-relaxed text-ink-muted">
          Oder direkt anrufen:{" "}
          <a
            href={business.phone.href}
            className="inline-flex items-center gap-1.5 font-semibold text-navy hover:text-gold-deep"
          >
            <Phone className="size-4" aria-hidden />
            {business.phone.display}
          </a>
        </p>
      </Container>
    </section>
  );
}
