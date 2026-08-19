import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { business } from "@/lib/business";

/* Vorschaubild für WhatsApp, Facebook, LinkedIn und Google.
   Wichtig, weil Arian den Link aus eBay-Kleinanzeigen und WhatsApp heraus
   teilt — dort ist dieses Bild das Erste, was ein Interessent sieht. */

export const runtime = "nodejs"; // liest das Logo vom Dateisystem
export const alt = `${business.name} — ${business.slogan}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#0b1a2f";
const GOLD = "#c99b46";

/**
 * Satori (der Renderer hinter ImageResponse) löst keine CSS-Variablen auf.
 * Das Logo-SVG arbeitet mit `var(--logo-ink, …)`, damit es sich im Footer
 * invertieren lässt — hier werden die Werte deshalb fest eingesetzt.
 */
function logoDataUri(): string {
  const raw = readFileSync(
    join(process.cwd(), "public", "brand", "logo-arizu-claim.svg"),
    "utf8",
  )
    .replace(/var\(--logo-ink,\s*#0B1A2F\)/g, "#ffffff")
    .replace(/var\(--logo-accent,\s*#C99B46\)/g, GOLD);
  return `data:image/svg+xml;base64,${Buffer.from(raw).toString("base64")}`;
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: NAVY,
          padding: "72px 80px",
        }}
      >
        {/* Goldene Diagonale oben rechts — greift den Bildaufbau aus Arians
            Designentwurf auf, ohne ein Foto zu brauchen. */}
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -180,
            width: 700,
            height: 700,
            background: GOLD,
            opacity: 0.14,
            transform: "rotate(32deg)",
          }}
        />

        <img src={logoDataUri()} width={520} height={255} alt="" />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 66,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {business.slogan}
          </div>
          <div style={{ fontSize: 30, color: GOLD, marginTop: 18, fontWeight: 700 }}>
            Für Privat- und Geschäftskunden
          </div>
          {/* Ein einzelner Textknoten: Satori verlangt sonst explizites
              display:flex, sobald ein div mehrere Kinder hat. */}
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.72)",
              marginTop: 26,
            }}
          >
            Gebäudereinigung · Grün- und Außenanlagenpflege · Entrümpelung und
            Auflösung · Objektbetreuung
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
