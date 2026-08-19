import { MessageCircle, Phone } from "lucide-react";
import { business, whatsappHref } from "@/lib/business";

/**
 * Fixe Aktionsleiste, nur mobil.
 *
 * Begründung: Der Verkehr kommt laut Briefing über Google und
 * eBay-Kleinanzeigen, also überwiegend mobil. Der kürzeste Weg zum Auftrag
 * ist dort ein Daumen auf "Anrufen" — nicht das Scrollen zum Formular.
 * WhatsApp steht daneben, weil Kunden bei Entrümpelung und Garten lieber
 * ein Foto schicken als eine Fläche zu schätzen.
 *
 * Das Padding-Bottom am <main> in app/layout.tsx hält den Footer frei.
 */
export function StickyCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-deep/40 bg-navy/97 backdrop-blur lg:hidden">
      <div className="grid grid-cols-2 divide-x divide-white/12">
        <a
          href={business.phone.href}
          className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white"
        >
          <Phone className="size-4 text-gold" aria-hidden />
          Anrufen
        </a>
        <a
          href={whatsappHref(
            `Hallo ${business.shortName}, ich habe eine Anfrage:`,
          )}
          target="_blank"
          rel="noopener"
          className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white"
        >
          <MessageCircle className="size-4 text-gold" aria-hidden />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
