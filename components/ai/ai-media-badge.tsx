import { cn } from "@/lib/utils";

/* ==================================================================
   Sichtbare KI-Kennzeichnung nach Art. 50 EU AI Act (Pflicht seit 02.08.2026).

   Optik: eine kleine, randlose Glasfläche. Hintergrundunschärfe und ein
   weicher Schlagschatten halten den Pflichttext auf hellen wie dunklen
   Motiven lesbar, ohne eine sichtbare Umrandung um das Badge zu zeichnen.

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
  "top-right": "top-1.5 right-1.5",
  "top-left": "top-1.5 left-1.5",
  "bottom-right": "bottom-1.5 right-1.5",
  "bottom-left": "bottom-1.5 left-1.5",
};

/** Glasoptik als eine Einheit — auch von anderen Overlays wiederverwendbar. */
export const glassSurface =
  "bg-navy/40 backdrop-blur-[8px] backdrop-saturate-150 " +
  "shadow-[0_2px_8px_rgba(0,0,0,0.2)]";

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
        "pointer-events-none absolute z-20 flex items-center gap-0.5 rounded-full",
        // Dezent, aber weiterhin als Text lesbar: Die Kennzeichnung darf nach
        // der Kundenanpassung weniger Motivfläche beanspruchen, ohne zu einer
        // reinen Symbolmarkierung zu werden.
        "px-1.5 py-[1.5px] text-[0.52rem] leading-none font-semibold tracking-wide text-white",
        // Textschatten: hält die Schrift auch dort lesbar, wo unter dem Glas
        // eine sehr helle Stelle liegt (weiße Fassade, Treppenhauswand).
        "[text-shadow:0_1px_3px_rgba(0,0,0,0.55)]",
        glassSurface,
        POSITION_CLASSES[position],
      )}
    >
      <span aria-hidden="true" className="text-[0.48rem] leading-none text-[#ffd89a]">
        ✦
      </span>
      {label}
    </span>
  );
}
