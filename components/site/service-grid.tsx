import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Sprout, SprayCan, Truck } from "lucide-react";
import { AiMedia } from "@/components/ai/ai-media";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

const icons = {
  building: Building2,
  spray: SprayCan,
  sprout: Sprout,
  truck: Truck,
} as const;

/**
 * Leistungsübersicht.
 *
 * Die Karten sind absichtlich NICHT alle gleich breit: ein 12-Spalten-Raster
 * im Wechsel 7/5 und 5/7 bricht das typische "drei identische Kacheln"-Muster
 * auf und gibt der Seite Rhythmus, ohne die Lesbarkeit zu opfern.
 *
 * `unoptimized` bei den Bildern ist eine bewusste Entscheidung: Der
 * Next-Optimizer re-encodiert und verwirft dabei die XMP-Metadaten mit dem
 * KI-Kennzeichnungs-Hinweis. Die Dateien sind bereits als WebP in Zielgröße
 * abgelegt (30–160 KB), es gibt also nichts zu gewinnen — dafür bleibt die
 * maschinenlesbare Kennzeichnung bis zum Browser erhalten.
 */
export function ServiceGrid() {
  return (
    <ul className="grid gap-5 lg:grid-cols-12">
      {services.map((s, i) => {
        const Icon = icons[s.icon];
        const wide = i % 4 === 0 || i % 4 === 3;
        return (
          <li
            key={s.slug}
            className={cn("lg:col-span-6", wide ? "xl:col-span-7" : "xl:col-span-5")}
          >
            <Link
              href={`/leistungen/${s.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-sm border border-mist bg-surface transition-colors hover:border-gold"
            >
              <AiMedia assetId={s.image.assetId} className="h-52 shrink-0 rounded-none">
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  width={s.image.width}
                  height={s.image.height}
                  unoptimized
                  className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </AiMedia>

              <div className="flex flex-1 flex-col p-7">
                <span className="inline-flex size-12 items-center justify-center rounded-full border border-gold/40 text-gold-deep">
                  <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                </span>

                <h3 className="mt-5 font-display text-xl text-navy">{s.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.teaser}</p>

                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
                  {s.items.slice(0, 5).map((item) => (
                    <li
                      key={item}
                      className="before:mr-1.5 before:text-gold before:content-['✓']"
                    >
                      {item}
                    </li>
                  ))}
                  {s.items.length > 5 && (
                    <li className="text-gold-deep">+ {s.items.length - 5} weitere</li>
                  )}
                </ul>

                <span className="mt-6 inline-flex items-center gap-2 pt-1 font-display text-sm font-bold text-navy transition-colors group-hover:text-gold-deep">
                  {s.hasPublicCalculator
                    ? "Preisschätzung ansehen"
                    : "Objektbetreuung anfragen"}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
