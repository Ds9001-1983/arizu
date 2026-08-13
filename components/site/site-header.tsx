"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { glassSurface } from "@/components/ai/ai-media-badge";
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
        <div className="flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link
            href="/"
            className="shrink-0"
            aria-label={`${business.name} — zur Startseite`}
            onClick={() => setOpen(false)}
          >
            {/* Über dem dunklen Hero muss die Wortmarke weiß laufen, sonst
                verschwindet Navy auf Navy. Dieselbe SVG-Quelle, nur andere
                CSS-Variable. */}
            <LogoWordmark
              className={cn(
                "h-8 w-auto transition-[--logo-ink] duration-300 sm:h-9",
                !solid && !open && "[--logo-ink:#ffffff]",
              )}
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Hauptnavigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  solid || open
                    ? "text-navy/80 hover:text-gold-deep"
                    : "text-white/85 hover:text-gold-soft",
                )}
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
              className={cn(
                "inline-flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-white transition-colors",
                solid || open ? "bg-navy hover:bg-navy-band" : glassSurface,
              )}
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{business.phone.display}</span>
              <span className="sm:hidden">Anrufen</span>
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-sm lg:hidden",
                solid || open
                  ? "border border-mist text-navy"
                  : "border border-white/30 text-white",
              )}
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
