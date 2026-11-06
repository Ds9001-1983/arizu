"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMarketingErlaubt } from "@/lib/tracking/einwilligung-client";
import { metaEreignis, pixelLaden } from "@/lib/tracking/meta-client";
import { META_EREIGNISSE } from "@/lib/tracking/meta";

/* ==================================================================
   Messung über Meta, nur mit Marketing-Einwilligung.

   - PageView bei jedem Seitenaufruf, auch bei Wechseln ohne Neuladen
   - ViewContent auf den Leistungsseiten, content_name = Name der Leistung
   - Contact bei Klick auf einen Telefon- oder WhatsApp-Link, egal wo er
     steht (Header, Footer, Handy-Leiste, Formulare). Ein einziger Zuhörer
     am window statt eines Eingriffs in jeden Link. Links mit
     data-meta-kein-kontakt zählen nicht: Dort meldet das Formular einen Lead.

   Lead und die Kundenart-Weiche melden ihre Formulare bzw. die Server
   Action selbst. Der interne Bereich wird nie gemessen.
   ================================================================== */

function kontaktKanal(href: string): string | null {
  if (href.startsWith("tel:")) return "Telefon";
  if (/^https:\/\/(api\.whatsapp\.com|wa\.me)\//.test(href)) return "WhatsApp";
  return null;
}

export function MetaTracking({ leistungen }: { leistungen: Record<string, string> }) {
  const erlaubt = useMarketingErlaubt();
  const pfad = usePathname();
  const intern = pfad.startsWith("/intern");
  const zuletzt = useRef<string | null>(null);

  useEffect(() => {
    if (erlaubt && !intern) pixelLaden();
  }, [erlaubt, intern]);

  // Steht hinter dem Laden des Pixels: Effekte laufen in Reihenfolge, der
  // Pixel kennt die ID also schon, wenn der erste PageView kommt.
  useEffect(() => {
    if (!erlaubt || intern || zuletzt.current === pfad) return;
    zuletzt.current = pfad;
    metaEreignis(META_EREIGNISSE.seitenaufruf);
    const slug = /^\/leistungen\/([^/]+)/.exec(pfad)?.[1];
    if (slug && leistungen[slug]) {
      metaEreignis(META_EREIGNISSE.leistung, {
        content_name: leistungen[slug],
        content_category: "Leistung",
      });
    }
  }, [erlaubt, intern, pfad, leistungen]);

  useEffect(() => {
    // Am window statt am document: React verteilt seine Klicks am document,
    // hier kommt der Klick danach an. So lässt sich erkennen, ob ein
    // Formular den Link per preventDefault aufgehalten hat.
    function klick(event: MouseEvent) {
      if (event.defaultPrevented || location.pathname.startsWith("/intern")) return;
      const ziel = event.target instanceof Element ? event.target : null;
      const link = ziel?.closest("a[href]");
      if (!link || link.closest("[data-meta-kein-kontakt]")) return;
      const kanal = kontaktKanal(link.getAttribute("href") ?? "");
      if (kanal) metaEreignis(META_EREIGNISSE.kontakt, { content_category: kanal });
    }
    window.addEventListener("click", klick);
    return () => window.removeEventListener("click", klick);
  }, []);

  return null;
}
