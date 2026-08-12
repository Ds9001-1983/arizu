#!/usr/bin/env python3
"""
Alle ARIZU-Logo-Varianten aus einer Quelle bauen.

Buchstaben kommen als echte Konturen aus Montserrat 700 (kein Webfont noetig,
funktioniert in LexWare, Druck und E-Mail), die Dachkontur aus Arians Original.

Ausgabe in public/brand/:
  logo-arizu.svg           Wortmarke, farbig ueber CSS-Variablen steuerbar
  logo-arizu-claim.svg     Wortmarke + Linie + gesperrte Subline (Flyer-Lockup)
  logo-arizu-mono.svg      einfarbig (currentColor) fuer Stempel/Fax/Folie
  icon-arizu.svg           nur Dach-Z, quadratisch — Favicon/App-Icon/Avatar

Farbsteuerung: fill="var(--logo-ink, #0B1A2F)". Ohne CSS greift der Fallback,
mit CSS (z.B. im Footer auf Navy) laesst sich dieselbe Datei invertieren.
"""

import json
import re
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

CAP_PX = 314.0
BASELINE = 529.0
CAP_TOP = BASELINE - CAP_PX
TARGET_INK_WIDTH = 1408.0
WORD = "ARIZU"
GOLD_LETTERS = {"Z"}

SUBLINE = "GEBÄUDEDIENSTLEISTUNGEN"
SUB_CAP = 46.0        # Versalhoehe der Subline (Flyer-Verhaeltnis ~1:6.8)
RULE_THICK = 5.0
GAP_ABOVE_RULE = 44.0
GAP_BELOW_RULE = 40.0

NAVY = "#0B1A2F"
GOLD = "#C99B46"
OUT = Path.home() / "Desktop/DEV/ARIZU/arizu/public/brand"

font = instancer.instantiateVariableFont(TTFont("Montserrat.ttf"), {"wght": 700})
SCALE = CAP_PX / font["OS/2"].sCapHeight
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
hmtx = font["hmtx"]
# Subline etwas leichter — sonst konkurriert sie mit der Wortmarke.
font_sub = instancer.instantiateVariableFont(TTFont("Montserrat.ttf"), {"wght": 500})
glyphs_sub = font_sub.getGlyphSet()
cmap_sub = font_sub.getBestCmap()
hmtx_sub = font_sub["hmtx"]
SUB_SCALE = SUB_CAP / font_sub["OS/2"].sCapHeight


def glyph_info(ch, gs, cm, hm, scale):
    name = cm[ord(ch)]
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    x0, y0, x1, y1 = bp.bounds
    adv, _ = hm[name]
    return {
        "name": name,
        "ink": (x1 - x0) * scale,
        "lsb": x0 * scale,
        "rsb": (adv - x1) * scale,
        "xmin": x0,
        "ymin": y0,
    }


def lay_out(text, gs, cm, hm, scale, target_width, baseline):
    """Text auf exakt target_width setzen; liefert (paths_je_zeichen, positionen)."""
    info = {i: glyph_info(ch, gs, cm, hm, scale) for i, ch in enumerate(text)}
    visible = [i for i, ch in enumerate(text) if ch != " "]
    ink = sum(info[i]["ink"] for i in visible)
    sides = sum(info[a]["rsb"] + info[b]["lsb"] for a, b in zip(visible, visible[1:]))
    track = (target_width - ink - sides) / (len(visible) - 1)

    out, pos, cursor = [], {}, 0.0
    for n, i in enumerate(visible):
        g = info[i]
        pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}")
        gs[g["name"]].draw(
            TransformPen(pen, (scale, 0, 0, -scale, cursor - g["xmin"] * scale, baseline))
        )
        out.append((text[i], pen.getCommands()))
        pos[text[i]] = (cursor, cursor + g["ink"])
        if n < len(visible) - 1:
            cursor += g["ink"] + g["rsb"] + track + info[visible[n + 1]]["lsb"]
    return out, pos, track, info


def roof_transform(pos, metrics):
    """Dach proportional ueber dem neuen Z ausrichten."""
    orig = {L["char"]: L for L in metrics["letters"]}
    old_i, old_z = float(orig["I"]["x0"]), float(orig["Z"]["x1"])
    new_i, new_z = pos["I"][0], pos["Z"][1]
    k = (new_z - new_i) / (old_z - old_i)
    svg = open("trace-roof.svg", encoding="utf-8").read()
    d = "\n".join(re.findall(r"<path\b[^>]*?\bd=\"(.*?)\"[^>]*/>", svg, re.S))
    ps = 0.1 / 3.0 * k
    dx = new_i - old_i * k
    dy = CAP_TOP * (1 - k) + metrics["height"] * k
    top = CAP_TOP - (CAP_TOP - metrics["roofBox"][1]) * k
    left = new_i - (old_i - metrics["roofBox"][0]) * k
    right = new_i + (metrics["roofBox"][2] - old_i) * k
    return d, f"translate({dx:.3f},{dy:.3f}) scale({ps:.9g},-{ps:.9g})", top, left, right


def svg_doc(view_w, view_h, body, label, shift_y=0.0):
    inner = f'  <g transform="translate(0,{shift_y:.3f})">\n{body}\n  </g>' if shift_y else body
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w:.0f} {view_h:.0f}"\n'
        f'     role="img" aria-label="{label}">\n  <title>{label}</title>\n{inner}\n</svg>\n'
    )


def group(paths, fill, label, transform=None):
    t = f' transform="{transform}"' if transform else ""
    inner = "\n".join(f'    <path d="{p}"/>' for p in paths)
    return f'  <g{t} fill="{fill}">\n    <title>{label}</title>\n{inner}\n  </g>'


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    metrics = json.load(open("letter-metrics.json"))

    letters, pos, track, info = lay_out(
        WORD, glyphs, cmap, hmtx, SCALE, TARGET_INK_WIDTH, BASELINE
    )
    navy_paths = [p for ch, p in letters if ch not in GOLD_LETTERS]
    gold_paths = [p for ch, p in letters if ch in GOLD_LETTERS]
    roof_d, roof_tf, roof_top, roof_left, roof_right = roof_transform(pos, metrics)

    u_bottom = BASELINE + (-info[4]["ymin"]) * SCALE
    top = min(roof_top, CAP_TOP)
    print(f"Wortmarke: Sperrung {track:+.1f}px, Dach x {roof_left:.0f}..{roof_right:.0f}")

    ink = "var(--logo-ink, %s)" % NAVY
    acc = "var(--logo-accent, %s)" % GOLD

    # --- 1) Wortmarke -------------------------------------------------------
    body = "\n".join(
        [
            group(navy_paths, ink, "ARI U"),
            group(gold_paths, acc, "Z"),
            group([roof_d], acc, "Dachkontur", roof_tf),
        ]
    )
    (OUT / "logo-arizu.svg").write_text(
        svg_doc(TARGET_INK_WIDTH, u_bottom - top, body, "ARIZU", -top), encoding="utf-8"
    )

    # --- 2) Einfarbig (currentColor) ---------------------------------------
    body_mono = "\n".join(
        [
            group(navy_paths + gold_paths, "currentColor", "ARIZU"),
            group([roof_d], "currentColor", "Dachkontur", roof_tf),
        ]
    )
    (OUT / "logo-arizu-mono.svg").write_text(
        svg_doc(TARGET_INK_WIDTH, u_bottom - top, body_mono, "ARIZU", -top),
        encoding="utf-8",
    )

    # --- 3) Lockup mit Claim ------------------------------------------------
    rule_y = u_bottom + GAP_ABOVE_RULE
    sub_baseline = rule_y + RULE_THICK + GAP_BELOW_RULE + SUB_CAP
    sub_letters, _, sub_track, _ = lay_out(
        SUBLINE, glyphs_sub, cmap_sub, hmtx_sub, SUB_SCALE, TARGET_INK_WIDTH, sub_baseline
    )
    print(f"Subline: Versal {SUB_CAP:.0f}px, Sperrung {sub_track:+.1f}px")
    body_claim = "\n".join(
        [
            group(navy_paths, ink, "ARI U"),
            group(gold_paths, acc, "Z"),
            group([roof_d], acc, "Dachkontur", roof_tf),
            f'  <rect x="0" y="{rule_y:.1f}" width="{TARGET_INK_WIDTH:.0f}" '
            f'height="{RULE_THICK}" fill="{ink}"/>',
            group([p for _, p in sub_letters], ink, "Gebäudedienstleistungen"),
        ]
    )
    sub_bottom = sub_baseline + 16  # Luft unter der Grundlinie, sonst wirkt es beschnitten
    (OUT / "logo-arizu-claim.svg").write_text(
        svg_doc(
            TARGET_INK_WIDTH,
            sub_bottom - top,
            body_claim,
            "ARIZU Gebäudedienstleistungen",
            -top,
        ),
        encoding="utf-8",
    )

    # --- 4) Icon: Dach-Z auf Navy-Flaeche, quadratisch ---------------------
    # Gold auf Weiss traegt im Browser-Tab nicht. Navy-Flaeche + Gold-Zeichen
    # gibt maximalen Kontrast und ist zugleich die Markenkombination.
    icon_left, icon_right = min(roof_left, pos["Z"][0]), max(roof_right, pos["Z"][1])
    icon_top, icon_bottom = roof_top, BASELINE
    w, h = icon_right - icon_left, icon_bottom - icon_top
    side = max(w, h) * 1.30  # Schutzraum rund um das Zeichen
    off_x = (side - w) / 2 - icon_left
    off_y = (side - h) / 2 - icon_top
    body_icon = (
        f'  <rect width="{side:.0f}" height="{side:.0f}" fill="var(--logo-ink, {NAVY})"/>\n'
        f'  <g transform="translate({off_x:.3f},{off_y:.3f})">\n'
        + group(gold_paths, acc, "Z")
        + "\n"
        + group([roof_d], acc, "Dachkontur", roof_tf)
        + "\n  </g>"
    )
    (OUT / "icon-arizu.svg").write_text(
        svg_doc(side, side, body_icon, "ARIZU"), encoding="utf-8"
    )
    print(f"Icon: Zeichen {w:.0f}x{h:.0f} in {side:.0f}x{side:.0f} Quadrat auf Navy")

    for f in sorted(OUT.glob("*.svg")):
        print(f"  {f.name}: {f.stat().st_size} Bytes")


if __name__ == "__main__":
    main()
