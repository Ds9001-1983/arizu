import { mitgliedschaften } from "@/lib/business";
import { cn } from "@/lib/utils";
import { Container } from "./container";

/* Vertrauensblock nach Arians Wunsch vom 04.11.2026 („für den Trust“).
   Steht auf der Startseite und bei den Geschäftskunden — für Hausverwaltungen
   und Firmen ist die Kammer-Eintragung und die Unfallversicherung des Teams
   oft eine Vorbedingung für den Auftrag. Herkunft der Logos in
   lib/business.ts. Jedes Logo verlinkt auf den Verband, so verlangt es die
   BG BAU für ihr Signet. */
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
          <ul className="grid gap-8 sm:grid-cols-2">
            {mitgliedschaften.map((m) => (
              <li key={m.name}>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener"
                  className="flex h-14 w-fit items-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG, kleiner als jeder Optimizer-Umweg; Bildoptimierung ist ohnehin aus (next.config.ts) */}
                  <img
                    src={m.logo.src}
                    width={m.logo.w}
                    height={m.logo.h}
                    alt={`Logo ${m.name}`}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "w-auto",
                      m.logo.h < 50 ? "h-9" : "h-14",
                    )}
                  />
                </a>
                <p className="mt-4 font-semibold text-navy">{m.kurz}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{m.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
