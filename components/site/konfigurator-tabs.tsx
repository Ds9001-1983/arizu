"use client";

import { useState } from "react";
import type { ConfiguratorSlug } from "@/lib/pricing";
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
export function KonfiguratorTabs({ initial = "entruempelung" }: { initial?: ConfiguratorSlug }) {
  const [active, setActive] = useState<ConfiguratorSlug>(initial);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Leistung wählen"
        className="flex flex-wrap gap-2"
      >
        {services.map((s) => {
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
        <Konfigurator key={active} slug={active} />
      </div>
    </div>
  );
}
