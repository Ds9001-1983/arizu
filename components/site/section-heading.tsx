import { cn } from "@/lib/utils";

/**
 * Überschriftenblock mit Eyebrow.
 *
 * Der Eyebrow ist absichtlich gesperrt und klein: er übernimmt die Sperrung
 * aus dem Logo-Lockup ("G E B Ä U D E D I E N S T L E I S T U N G E N") und
 * zieht damit ein Detail der Marke durch die ganze Seite.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  invert = false,
  as: As = "h2",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  invert?: boolean;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em]",
            invert ? "text-gold-soft" : "text-gold-deep",
          )}
        >
          {eyebrow}
        </p>
      )}
      <As
        className={cn(
          "mt-3 text-3xl leading-[1.08] sm:text-4xl lg:text-[2.9rem]",
          invert ? "text-white" : "text-navy",
        )}
      >
        {title}
      </As>
      {lead && (
        <p
          className={cn(
            "mt-5 text-[1.05rem] leading-relaxed",
            invert ? "text-white/75" : "text-ink-muted",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
