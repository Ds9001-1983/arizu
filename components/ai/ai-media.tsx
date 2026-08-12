import { cn } from "@/lib/utils";
import { AiMediaBadge, type BadgePosition } from "./ai-media-badge";

/**
 * Wrapper für kennzeichnungspflichtige Medien.
 *
 * Das <figure> liefert den `relative`-Kontext, auf dem das absolut
 * positionierte Badge sitzt — ohne diesen Wrapper würde das Badge an den
 * nächsten positionierten Vorfahren springen.
 *
 * Warum das Badge im DOM liegt und nicht ins Bild gebrannt ist:
 * next/image re-encodiert und verwirft dabei XMP-Metadaten. Ein DOM-Badge
 * bleibt bei jeder Pixeldichte scharf, ist per Playwright nachweisbar und
 * wird von Screenreadern als echter Text gelesen.
 */
export function AiMedia({
  assetId,
  badgePosition = "top-right",
  className,
  children,
}: {
  assetId: string;
  badgePosition?: BadgePosition;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={cn("relative m-0 overflow-hidden", className)}>
      {children}
      <AiMediaBadge assetId={assetId} position={badgePosition} />
    </figure>
  );
}
