#!/usr/bin/env python3
"""
components/site/logo.tsx aus den gebauten SVGs generieren.

Warum inline statt <img src="logo.svg">: Der Header braucht Navy-Buchstaben,
der Footer weisse auf Navy. Ueber ein <img> greifen keine CSS-Variablen, also
braeuchte es zwei Dateien und zwei Requests. Inline kostet keinen Request und
laesst sich per Klasse umfaerben.

Generiert, nicht handgepflegt: so bleibt die Pfadgeometrie garantiert
identisch zu den Dateien in public/brand/.
"""

import re
from pathlib import Path

ROOT = Path.home() / "Desktop/DEV/ARIZU/arizu"
BRAND = ROOT / "public/brand"
OUT = ROOT / "components/site/logo.tsx"


def inner(svg_file: Path) -> tuple[str, str]:
    """Liefert (viewBox, Innen-Markup) — ohne <svg>-Huelle und ohne <title>."""
    raw = svg_file.read_text(encoding="utf-8")
    vb = re.search(r'viewBox="([^"]+)"', raw).group(1)
    body = re.sub(r"^.*?<title>.*?</title>\s*", "", raw, flags=re.S)
    body = body.rsplit("</svg>", 1)[0]
    body = re.sub(r"<title>.*?</title>\s*", "", body, flags=re.S)
    # JSX: fill="var(--logo-ink, #0B1A2F)" ist gueltig, Attribute passen 1:1.
    return vb, body.strip()


def main() -> None:
    wm_vb, wm = inner(BRAND / "logo-arizu.svg")
    cl_vb, cl = inner(BRAND / "logo-arizu-claim.svg")
    ic_vb, ic = inner(BRAND / "icon-arizu.svg")

    tsx = f'''/* GENERIERT von scripts/logo/emit_logo_component.py — nicht von Hand aendern.
   Quelle: public/brand/*.svg (Buchstaben als Montserrat-700-Konturen,
   Dachkontur aus Arians Original-Entwurf).

   Farben laufen ueber CSS-Variablen:
     --logo-ink     Buchstaben (Default Navy)
     --logo-accent  Z + Dach   (Default Gold)
   Auf Navy-Flaechen reicht `className="[--logo-ink:#fff]"`, um zu invertieren.
*/

type LogoProps = {{
  className?: string;
  /** Sichtbarer Name fuer Screenreader. Im Header sinnvoll, in Wiederholungen leer. */
  label?: string;
}};

export function LogoWordmark({{ className, label = "ARIZU" }}: LogoProps) {{
  return (
    <svg
      viewBox="{wm_vb}"
      className={{className}}
      role="img"
      aria-label={{label || undefined}}
      aria-hidden={{label ? undefined : true}}
    >
      {wm}
    </svg>
  );
}}

export function LogoClaim({{ className, label = "ARIZU Gebäudedienstleistungen" }}: LogoProps) {{
  return (
    <svg
      viewBox="{cl_vb}"
      className={{className}}
      role="img"
      aria-label={{label || undefined}}
      aria-hidden={{label ? undefined : true}}
    >
      {cl}
    </svg>
  );
}}

export function LogoIcon({{ className, label = "" }}: LogoProps) {{
  return (
    <svg
      viewBox="{ic_vb}"
      className={{className}}
      role="img"
      aria-label={{label || undefined}}
      aria-hidden={{label ? undefined : true}}
    >
      {ic}
    </svg>
  );
}}
'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(tsx, encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)}: {len(tsx)} Bytes")


if __name__ == "__main__":
    main()
