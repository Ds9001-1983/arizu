"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { business } from "@/lib/business";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { LogoWordmark } from "./logo";

const nav = [
  ...services.map((s) => ({ href: `/leistungen/${s.slug}`, label: s.name })),
  { href: "/kontakt", label: "Kontakt" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  // Der Header wird erst nach dem Hero deckend. Ohne diesen Wechsel läge das
  // Navy-Band direkt auf dem Hero-Bild und würde es zerschneiden.
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menü bei Routenwechsel bzw. Escape schließen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        solid || open
          ? "bg-shell/95 backdrop-blur border-b border-mist"
          : "bg-transparent",
      )}
    >
      <Container>
        <div className="flex items-center justify-between gap-6 py-4">
          <Link
            href="/"
            className="shrink-0"
            aria-label={`${business.name} — zur Startseite`}
            onClick={() => setOpen(false)}
          >
            <LogoWordmark className="h-8 w-auto sm:h-9" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Hauptnavigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-navy/80 transition-colors hover:text-gold-deep"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Telefon ist bei Dienstleistung der kürzeste Weg zum Auftrag —
                deshalb dauerhaft sichtbar, ab sm mit Nummer im Klartext. */}
            <a
              href={business.phone.href}
              className="inline-flex items-center gap-2 rounded-sm bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-band"
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{business.phone.display}</span>
              <span className="sm:hidden">Anrufen</span>
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex size-11 items-center justify-center rounded-sm border border-mist text-navy lg:hidden"
              aria-expanded={open}
              aria-controls="mobil-navigation"
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
            >
              {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
      </Container>

      {open && (
        <nav
          id="mobil-navigation"
          className="border-t border-mist bg-shell lg:hidden"
          aria-label="Hauptnavigation"
        >
          <Container>
            <ul className="divide-y divide-mist py-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-base font-medium text-navy"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
