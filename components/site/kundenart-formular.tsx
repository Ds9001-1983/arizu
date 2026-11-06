"use client";

import type { ReactNode } from "react";
import type { LeadKundenart } from "@/lib/db";
import { neueEventId, pixelEreignis } from "@/lib/tracking/meta-client";
import { META_EREIGNISSE } from "@/lib/tracking/meta";

/* ==================================================================
   Formular um den Knopf der Kundenart-Weiche.

   Beim Absenden entsteht eine event_id. Sie geht im versteckten Feld an die
   Server Action (Conversions API) und gleichzeitig an den Pixel. Meta führt
   beide über die ID zusammen. Ohne Marketing-Einwilligung meldet
   pixelEreignis nichts, und die Server Action schickt ebenfalls nichts.

   React ruft onSubmit vor der Form-Action auf und liest das FormData erst
   danach. Der Wert im versteckten Feld ist deshalb schon gesetzt. Ohne
   JavaScript funktioniert die Weiche weiter; die Server Action erzeugt
   dann selbst eine ID.
   ================================================================== */

export function KundenartFormular({
  action,
  kundenart,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  kundenart: LeadKundenart;
  className?: string;
  children: ReactNode;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        const eventId = neueEventId();
        const feld = event.currentTarget.elements.namedItem("eventId");
        if (feld instanceof HTMLInputElement) feld.value = eventId;
        pixelEreignis(
          kundenart === "geschaeft"
            ? META_EREIGNISSE.weicheGeschaeft
            : META_EREIGNISSE.weichePrivat,
          eventId,
          { content_category: "Kundenart-Weiche" },
        );
      }}
    >
      <input type="hidden" name="eventId" defaultValue="" />
      {children}
    </form>
  );
}
