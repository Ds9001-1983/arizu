#!/usr/bin/env python3
"""
Kanonisches ARIZU-Logo bauen: Buchstaben aus Montserrat 700 als echte
Konturen, Dachkontur aus Arians Original (die kommt aus keiner Schrift).

Warum so:
  * I und U aus Montserrat deckten sich mit dem Original auf unter 3 px
    (inkl. 5,3 px Overshoot am U) -> Montserrat ist die Quellschrift.
  * A, R und Z waren im Original 3-7 % schmaler. Betroffen sind genau die
    Buchstaben mit Diagonalen, also KI-Verzerrung. Montserrats Breiten sind
    die richtigen.
  * Laufweite: statt der uneinheitlichen Original-Abstaende (50/37/54/58 px)
    werden Montserrats eigene Vor-/Nachbreiten benutzt plus eine gleichmaessige
    Sperrung, die so gewaehlt ist, dass die Gesamtbreite der Wortmarke
    unveraendert bleibt. Ergebnis: typografisch saubere Verteilung im
    identischen Platzbedarf.
  * Dach: wird uniform mitskaliert und ueber dem neuen Z ausgerichtet, damit
    Strichstaerke und Abstand zur Versallinie proportional bleiben.

Ausgabe: logo-wordmark.svg (nur Wortmarke) — Basis fuer alle Lockups.
"""

import json
import re
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

CAP_PX = 314.0
BASELINE = 529.0
CAP_TOP = BASELINE - CAP_PX  # 215, deckt sich mit der Messung
TARGET_INK_WIDTH = 1408.0  # Original: A-Beginn bis U-Ende
WORD = "ARIZU"
GOLD_LETTERS = {"Z"}

NAVY = "#0B1A2F"
GOLD = "#C99B46"


def roof_path() -> tuple[str, float]:
    """Dachpfad aus der potrace-Ausgabe holen; Rueckgabe (d, mask_scale)."""
    svg = open("trace-roof.svg", encoding="utf-8").read()
    d = "\n".join(re.findall(r"<path\b[^>]*?\bd=\"(.*?)\"[^>]*/>", svg, re.S))
    if not d:
        raise SystemExit("Kein Dachpfad in trace-roof.svg")
    return d, 3.0  # make_masks.py hat 3x hochskaliert


def main() -> None:
    metrics = json.load(open("letter-metrics.json"))
    orig = {L["char"]: L for L in metrics["letters"]}
    old_i_left = float(orig["I"]["x0"])
    old_z_right = float(orig["Z"]["x1"])

    font = instancer.instantiateVariableFont(TTFont("Montserrat.ttf"), {"wght": 700})
    scale = CAP_PX / font["OS/2"].sCapHeight
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]

    # Glyph-Geometrie sammeln
    info = {}
    for ch in WORD:
        name = cmap[ord(ch)]
        bp = BoundsPen(glyphs)
        glyphs[name].draw(bp)
        x0, y0, x1, y1 = bp.bounds
        adv, lsb = hmtx[name]
        info[ch] = {
            "name": name,
            "ink": (x1 - x0) * scale,
            "lsb": x0 * scale,
            "rsb": (adv - x1) * scale,
            "xmin": x0,
            "ymin": y0,
        }

    # Sperrung so loesen, dass die Gesamt-Tintenbreite erhalten bleibt:
    # ink_sum + sum(rsb_i + track + lsb_i+1) = TARGET
    ink_sum = sum(info[c]["ink"] for c in WORD)
    side_sum = sum(info[a]["rsb"] + info[b]["lsb"] for a, b in zip(WORD, WORD[1:]))
    track = (TARGET_INK_WIDTH - ink_sum - side_sum) / (len(WORD) - 1)
    print(f"Versal {CAP_PX:.0f}px | Tinte {ink_sum:.1f} + Seitenraender {side_sum:.1f}")
    print(f"-> Sperrung {track:+.1f}px je Paar, Gesamtbreite {TARGET_INK_WIDTH:.0f}px")

    # Buchstaben setzen
    pen_out = {"navy": [], "gold": []}
    cursor = 0.0  # linke Tintenkante des aktuellen Buchstaben
    positions = {}
    for idx, ch in enumerate(WORD):
        g = info[ch]
        tx = cursor - g["xmin"] * scale
        pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.2f}")
        # (xx, xy, yx, yy, dx, dy): y spiegeln, Grundlinie auf BASELINE legen
        glyphs[g["name"]].draw(TransformPen(pen, (scale, 0, 0, -scale, tx, BASELINE)))
        bucket = "gold" if ch in GOLD_LETTERS else "navy"
        pen_out[bucket].append(pen.getCommands())
        positions[ch] = (cursor, cursor + g["ink"])
        print(f"  {ch}: x {cursor:7.1f}..{cursor + g['ink']:7.1f}")
        if idx < len(WORD) - 1:
            nxt = info[WORD[idx + 1]]
            cursor += g["ink"] + g["rsb"] + track + nxt["lsb"]

    # Dach proportional ueber dem neuen Z ausrichten
    new_i_left, _ = positions["I"]
    _, new_z_right = positions["Z"]
    k = (new_z_right - new_i_left) / (old_z_right - old_i_left)
    d, mask_scale = roof_path()
    # potrace: internal/10/mask_scale -> Originalpixel. Danach k um (old_i_left,
    # CAP_TOP) skalieren und auf die neue I-Kante schieben.
    ps = 0.1 / mask_scale * k
    dx = new_i_left - old_i_left * k
    dy = CAP_TOP * (1 - k)
    roof_group = (
        f'  <g transform="translate({dx:.3f},{dy + metrics["height"] * k:.3f}) '
        f'scale({ps:.9g},-{ps:.9g})" fill="var(--logo-accent, {GOLD})">\n'
        f"    <title>Dachkontur</title>\n"
        f'    <path d="{d}"/>\n'
        f"  </g>"
    )

    # Zeichenflaeche: Overshoot des U unten, Dach oben
    u_bottom = BASELINE + (-info["U"]["ymin"]) * scale
    roof_top = CAP_TOP - (CAP_TOP - metrics["roofBox"][1]) * k
    top = min(roof_top, CAP_TOP)
    height = u_bottom - top
    width = TARGET_INK_WIDTH

    def letters_group(bucket: str, colour_var: str, fallback: str, label: str) -> str:
        paths = "\n".join(f'    <path d="{p}"/>' for p in pen_out[bucket])
        return (
            f'  <g fill="var({colour_var}, {fallback})">\n'
            f"    <title>{label}</title>\n{paths}\n  </g>"
        )

    body = "\n".join(
        [
            letters_group("navy", "--logo-ink", NAVY, "ARI U"),
            letters_group("gold", "--logo-accent", GOLD, "Z"),
            roof_group,
        ]
    )
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.0f} {height:.0f}"\n'
        f'     role="img" aria-label="ARIZU">\n'
        f"  <title>ARIZU</title>\n"
        f'  <g transform="translate(0,{-top:.3f})">\n{body}\n  </g>\n'
        f"</svg>\n"
    )
    open("logo-wordmark.svg", "w", encoding="utf-8").write(svg)
    print(f"\nlogo-wordmark.svg: viewBox 0 0 {width:.0f} {height:.0f}, {len(svg)} Bytes")


if __name__ == "__main__":
    main()
