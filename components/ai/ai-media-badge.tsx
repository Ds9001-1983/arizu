import { cn } from "@/lib/utils";

/* ==================================================================
   Sichtbare KI-Kennzeichnung nach Art. 50 EU AI Act (Pflicht seit 02.08.2026).

   Aufbau nach dem SUPERBRAND KI-Label-Standard, Akzentfarbe hier Gold statt
   SUPERBRAND-Grün.

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
  "top-right": "top-2.5 right-2.5",
  "top-left": "top-2.5 left-2.5",
  "bottom-right": "bottom-2.5 right-2.5",
  "bottom-left": "bottom-2.5 left-2.5",
};

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
        "pointer-events-none absolute z-20 flex items-center gap-1 rounded-xs bg-navy/80 px-2 py-1.5 text-[0.7rem] font-semibold tracking-wide text-white backdrop-blur-sm",
        POSITION_CLASSES[position],
      )}
    >
      <span aria-hidden="true" className="text-gold">
        ✦
      </span>{" "}
      {label}
    </span>
  );
}
