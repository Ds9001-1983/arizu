import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { business, serviceArea } from "@/lib/business";
import { Container } from "./container";
import { LogoClaim } from "./logo";

const legal = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy-band text-white">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:gap-8">
          <div>
            {/* Dieselbe SVG-Quelle wie im Header, nur umgefärbt: die
                Buchstaben laufen über --logo-ink, das Z bleibt Gold. */}
            <LogoClaim className="h-20 w-auto [--logo-ink:#ffffff]" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">
              {business.intro}
            </p>
          </div>

          <div>
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">
              Bereiche
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  href="/privatkunden"
                  className="text-white/80 transition-colors hover:text-gold-soft"
                >
                  Für Privatkunden
                </Link>
              </li>
              <li>
                <Link
                  href="/geschaeftskunden"
                  className="text-white/80 transition-colors hover:text-gold-soft"
                >
                  Für Geschäftskunden
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="text-white/80 transition-colors hover:text-gold-soft"
                >
                  Kontakt aufnehmen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">
              Kontakt
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>
                  {business.address.street ? `${business.address.street}, ` : ""}
                  {business.address.postalCode} {business.address.city}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <a
                  href={business.phone.href}
                  className="inline-block py-1 hover:text-gold-soft"
                >
                  {business.phone.display}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <a href={`mailto:${business.email}`} className="break-all hover:text-gold-soft">
                  {business.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>
                  {business.openingHours.map((h) => (
                    <span key={h.days.join()} className="block">
                      {h.days.length > 1
                        ? `${h.days[0]}–${h.days[h.days.length - 1]}`
                        : h.days[0]}{" "}
                      {h.opens}–{h.closes} Uhr
                    </span>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/12 py-6 text-xs text-white/55">
          <p className="leading-relaxed">
            Einsatzgebiet: {serviceArea.label} sowie angrenzende Orte im Umkreis von{" "}
            {serviceArea.radiusKm} km um {serviceArea.center}.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="py-1.5">
              © {new Date().getFullYear()} {business.name}
            </span>
            {legal.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-block py-1.5 hover:text-gold-soft"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://superbrand.marketing"
              className="ml-auto inline-block py-1.5 hover:text-gold-soft"
              rel="noopener"
            >
              Made with ❤️ by SUPERBRAND.marketing – Dein Superheld für deine Werbung.
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
