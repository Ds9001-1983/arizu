import { HardHat, Landmark } from "lucide-react";
import { mitgliedschaften } from "@/lib/business";
import { cn } from "@/lib/utils";
import { Container } from "./container";

/* Vertrauensblock nach Arians Wunsch vom 04.11.2026 („für den Trust“).
   Steht auf der Startseite und bei den Geschäftskunden — für Hausverwaltungen
   und Firmen ist die Kammer-Eintragung und die Unfallversicherung des Teams
   oft eine Vorbedingung für den Auftrag. Text statt Verbandslogos, Grund in
   lib/business.ts. */
const icons = [Landmark, HardHat];

export function Mitgliedschaften({ className }: { className?: string }) {
  return (
    <section aria-labelledby="mitgliedschaften" className={cn("py-14 sm:py-16", className)}>
      <Container>
        <div className="grid gap-8 border-y border-mist py-10 lg:grid-cols-[0.8fr_2fr] lg:items-center lg:gap-16">
          <h2
            id="mitgliedschaften"
            className="font-display text-xl text-navy sm:text-2xl"
          >
            Eingetragen und versichert
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2">
            {mitgliedschaften.map((m, i) => {
              const Icon = icons[i] ?? Landmark;
              return (
                <li key={m.name} className="flex gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-mist bg-surface">
                    <Icon className="size-6 text-gold-deep" strokeWidth={1.5} aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-navy">{m.kurz}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{m.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
