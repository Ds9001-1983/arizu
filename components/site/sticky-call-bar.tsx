"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Calculator,
  ClipboardList,
  MessageCircle,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";
import { business, whatsappHref } from "@/lib/business";
import { cn } from "@/lib/utils";

/**
 * Fixe Aktionsleiste, nur mobil.
 *
 * Begründung: Der Verkehr kommt laut Briefing über Google und
 * eBay-Kleinanzeigen, also überwiegend mobil. Der kürzeste Weg zum Auftrag
 * ist dort ein Daumen auf "Anrufen" — nicht das Scrollen zum Formular.
 * WhatsApp steht daneben, weil Kunden bei Entrümpelung und Garten lieber
 * ein Foto schicken als eine Fläche zu schätzen.
 *
 * Seit 04.11.2026 mit einer dritten, hervorgehobenen Aktion, die zur Seite
 * passt (Wunsch von Dennis: den Preisrechner sichtbarer machen):
 * - Privatkunden und Leistungen mit Rechner: „Preis schätzen“
 * - Geschäftskunden: „Bedarf schildern“ — dort gibt es bewusst keinen
 *   öffentlichen Preis (Kundengespräch 14.08.2026)
 * - Hausmeisterservice: „Anfragen“, die Leistung hat keinen Rechner
 * Sie steht rechts, im Daumenbereich der meisten Nutzer, weiß auf Navy —
 * hervorgehoben ohne Goldfläche (Arians Wunsch vom 04.11.2026).
 *
 * Solange ein Eingabefeld den Fokus hat, verschwindet die Leiste: Auf dem
 * Handy schiebt die Tastatur sie sonst über das Feld, in das man gerade
 * tippt — beim Rechner und den Formularen wäre das ständig der Fall.
 *
 * Das Padding-Bottom am <body> in app/layout.tsx hält den Footer frei.
 */

type Aktion = { href: string; label: string; icon: LucideIcon };

function aktionFuer(pfad: string, rechnerSlugs: string[]): Aktion {
  if (pfad.startsWith("/geschaeftskunden")) {
    return { href: "#bedarf", label: "Bedarf schildern", icon: ClipboardList };
  }
  if (pfad === "/privatkunden") {
    return { href: "#richtpreis", label: "Preis schätzen", icon: Calculator };
  }
  if (pfad.startsWith("/leistungen/")) {
    const slug = pfad.split("/")[2];
    return rechnerSlugs.includes(slug)
      ? { href: "#rechner", label: "Preis schätzen", icon: Calculator }
      : { href: "#anfrage", label: "Anfragen", icon: Send };
  }
  return { href: "/privatkunden#richtpreis", label: "Preis schätzen", icon: Calculator };
}

function istEingabe(el: EventTarget | null): boolean {
  return (
    el instanceof HTMLElement &&
    el.matches("input:not([type=checkbox]):not([type=radio]), textarea, select")
  );
}

export function StickyCallBar({ rechnerSlugs }: { rechnerSlugs: string[] }) {
  const pfad = usePathname();
  const [tippt, setTippt] = useState(false);

  useEffect(() => {
    const rein = (e: FocusEvent) => istEingabe(e.target) && setTippt(true);
    const raus = (e: FocusEvent) => istEingabe(e.target) && setTippt(false);
    document.addEventListener("focusin", rein);
    document.addEventListener("focusout", raus);
    return () => {
      document.removeEventListener("focusin", rein);
      document.removeEventListener("focusout", raus);
    };
  }, []);

  // Der interne Bereich ist Arians Werkzeug, keine Kundenseite.
  if (pfad.startsWith("/intern")) return null;

  const aktion = aktionFuer(pfad, rechnerSlugs);
  const zelle =
    "flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-semibold";

  return (
    <nav
      aria-label="Schnellkontakt"
      data-sticky-bar
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-200 lg:hidden",
        tippt && "translate-y-full",
      )}
    >
      <div className="grid grid-cols-3 divide-x divide-white/12">
        <a href={business.phone.href} className={cn(zelle, "text-white")}>
          <Phone className="size-5 text-gold" aria-hidden />
          Anrufen
        </a>
        <a
          href={whatsappHref(
            `Hallo ${business.shortName}, ich habe eine Anfrage:`,
          )}
          target="_blank"
          rel="noopener"
          className={cn(zelle, "text-white")}
        >
          <MessageCircle className="size-5 text-gold" aria-hidden />
          WhatsApp
        </a>
        <a href={aktion.href} className={cn(zelle, "bg-white text-navy")}>
          <aktion.icon className="size-5" aria-hidden />
          {aktion.label}
        </a>
      </div>
    </nav>
  );
}
