"use client";

import { useState } from "react";
import type { ConfiguratorSlug, Rates } from "@/lib/pricing";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";
import { Konfigurator } from "./konfigurator";

/**
 * Konfigurator-Auswahl für die Startseite.
 *
 * Auf den Leistungsseiten steht jeweils nur der passende Rechner. Hier kann
 * der Besucher wechseln, ohne die Seite zu verlassen — er soll die Zahl
 * sehen, bevor er weiterklickt.
 */
export function KonfiguratorTabs({
  rates,
  initial = "gebaeudereinigung",
}: {
  /** Ausschließlich Sätze der öffentlich angebotenen Rechner. */
  rates: Partial<Record<ConfiguratorSlug, Rates>>;
  initial?: ConfiguratorSlug;
}) {
  const rechnerServices = services.filter((service) => service.hasPublicCalculator);
  const [active, setActive] = useState<ConfiguratorSlug>(() =>
    rechnerServices.some((service) => service.slug === initial)
      ? initial
      : rechnerServices[0].slug,
  );
  const activeRates = rates[active];
  if (!activeRates) throw new Error(`Keine öffentlichen Sätze für ${active}.`);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Leistung wählen"
        className="flex flex-wrap gap-2"
      >
        {rechnerServices.map((s) => {
          const selected = s.slug === active;
          return (
            <button
              key={s.slug}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`konfigurator-${s.slug}`}
              onClick={() => setActive(s.slug)}
              className={cn(
                "rounded-sm border px-4 py-2.5 font-display text-sm font-bold transition-colors",
                selected
                  ? "border-navy bg-navy text-white"
                  : "border-mist bg-surface text-navy hover:border-gold",
              )}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      <div id={`konfigurator-${active}`} role="tabpanel" className="mt-5">
        <Konfigurator key={active} slug={active} rates={activeRates} />
      </div>
    </div>
  );
}
