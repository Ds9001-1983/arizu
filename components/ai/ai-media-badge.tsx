import { cn } from "@/lib/utils";

/* ==================================================================
   Sichtbare KI-Kennzeichnung nach Art. 50 EU AI Act (Pflicht seit 02.08.2026).

   Optik: helles Glas nach Apple-Vorbild. Was den Effekt ausmacht, ist nicht
   die Transparenz allein, sondern das Zusammenspiel aus vier Dingen:
     1. backdrop-blur + Sättigungsanhebung — der Untergrund wird nicht nur
        verwischt, sondern farbiger, dadurch wirkt das Glas "lebendig"
     2. eine helle Haarlinie als Kante (die Lichtbrechung am Glasrand)
     3. ein heller Innenschein oben (box-shadow inset) — das Glanzlicht
     4. ein weicher Schlagschatten, der das Element abhebt

   Die Füllung liegt bei 18 % Weiß mit einem Hauch Navy im Verlauf. Reines
   Weiß-auf-Weiß wäre eleganter, kippt aber auf hellen Motiven — und dieses
   Badge sitzt auch auf dem fast weißen Treppenhausbild.

   Zwei Details, die kein Zufall sind:
   - Das Badge trägt IMMER Text, nie nur das ✦-Zeichen. Ein reines Farb- oder
     Symbolsignal wäre nach BFSG nicht ausreichend.
   - `data-ai-badge` ist der Haken, an dem der Playwright-Pflichttest die
     Kennzeichnung nachweist und die Belegscreenshots erzeugt.
   ================================================================== */

export type BadgePosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "caption-below";

const POSITION_CLASSES: Record<Exclude<BadgePosition, "caption-below">, string> = {
  "top-right": "top-3 right-3",
  "top-left": "top-3 left-3",
  "bottom-right": "bottom-3 right-3",
  "bottom-left": "bottom-3 left-3",
};

/** Glasoptik als eine Einheit — auch von anderen Overlays wiederverwendbar. */
export const glassSurface =
  "border border-white/35 bg-linear-to-b from-white/22 to-navy/12 " +
  "backdrop-blur-[16px] backdrop-saturate-180 " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_6px_20px_rgba(0,0,0,0.28)]";

export function AiMediaBadge({
  assetId,
  position = "top-right",
  label = "KI-generiert",
}: {
  assetId: string;
  position?: BadgePosition;
  label?: string;
}) {
  if (position === "caption-below") {
    // Rückfallebene, wenn keine Ecke frei ist, ohne das Motiv zu verdecken.
    return (
      <figcaption data-ai-badge={assetId} className="mt-1.5 text-xs text-ink-muted">
        <span aria-hidden="true" className="text-gold-deep">
          ✦
        </span>{" "}
        Dieses Bild wurde mit KI erstellt.
      </figcaption>
    );
  }

  return (
    <span
      data-ai-badge={assetId}
      className={cn(
        "pointer-events-none absolute z-20 flex items-center gap-1 rounded-full",
        // Kompakt gehalten: Schrift und Innenabstände rund 20 % kleiner als
        // zuvor, senkrecht bewusst noch etwas enger. `leading-none` nimmt die
        // Zeilenbox-Luft raus — ohne das bliebe die Pille trotz kleinerer
        // Werte hoch, weil die Zeilenhöhe den Innenraum aufspannt.
        "px-2.5 py-[3px] text-[0.66rem] leading-none font-semibold tracking-wide text-white",
        // Textschatten: hält die Schrift auch dort lesbar, wo unter dem Glas
        // eine sehr helle Stelle liegt (weiße Fassade, Treppenhauswand).
        "[text-shadow:0_1px_3px_rgba(0,0,0,0.55)]",
        glassSurface,
        POSITION_CLASSES[position],
      )}
    >
      <span aria-hidden="true" className="text-[0.62rem] leading-none text-[#ffd89a]">
        ✦
      </span>
      {label}
    </span>
  );
}
