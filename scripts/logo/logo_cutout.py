#!/usr/bin/env python3
"""
ARIZU-Logo aus dem WhatsApp-JPEG freistellen.

Warum nicht "Weiss transparent machen": Der Hintergrund ist #FDFDFD/#FEFEFE,
nicht reinweiss. Ein Schwellwert-Key wuerde die Antialiasing-Kanten als hellen
Halo stehen lassen — sichtbar, sobald das Logo auf Navy oder Gold liegt.

Stattdessen Zwei-Farben-Matting: Jedes Pixel ist eine Mischung aus Hintergrund
und genau einer Tintenfarbe (Navy oder Gold). Fuer beide Kandidaten wird die
Projektion auf die Linie bg->ink berechnet; der Kandidat mit dem kleinsten
Abstand zur Linie gewinnt. t ist dann der Deckungsgrad (Alpha), und als
Farbwert wird die reine Tintenfarbe geschrieben (unpremultiplied).
Ergebnis: harte, halo-freie Kanten bei korrektem Antialiasing.
"""

import sys
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "logo-source.jpeg"
OUT = sys.argv[2] if len(sys.argv) > 2 else "logo-arizu.png"

# Aus dem Bild gemessen (siehe Plan): Navy #0B1A2F, Gold #C99B46, Grund #FDFDFD.
BG = (253, 253, 253)
INKS = {"navy": (11, 26, 47), "gold": (201, 155, 70)}
# Ab diesem Abstand zur bg->ink-Linie gilt ein Pixel als "gehoert nicht dazu".
MAX_RESIDUAL = 42.0
# JPEG-Rauschen erzeugt flaechig Deckungsgrade von 1-3 % ueber das ganze Bild.
# Gemessen: unterhalb Alpha 8 ist nichts Echtes mehr, ab 8 beginnt die
# Antialiasing-Kante (bbox bei alpha>=8 deckt sich mit dem Motiv).
T_FLOOR = 8 / 255
# Volltonflaechen landen wegen JPEG-Kompression bei t ~0.95 statt 1.0. Ohne
# Snap waere das komplette Logo dauerhaft ~5 % transparent.
T_CEIL = 0.90


def matte(src_path: str, out_path: str) -> None:
    im = Image.open(src_path).convert("RGB")
    w, h = im.size
    src = im.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dst = out.load()

    # Richtungsvektoren bg -> ink einmal vorberechnen.
    lines = []
    for name, ink in INKS.items():
        d = tuple(ink[i] - BG[i] for i in range(3))
        len2 = sum(c * c for c in d)
        lines.append((name, ink, d, len2))

    for y in range(h):
        for x in range(w):
            p = src[x, y]
            v = (p[0] - BG[0], p[1] - BG[1], p[2] - BG[2])

            best = None
            for name, ink, d, len2 in lines:
                t = (v[0] * d[0] + v[1] * d[1] + v[2] * d[2]) / len2
                t = 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)
                # Abstand des Pixels zur Linie bg->ink
                res = sum((v[i] - t * d[i]) ** 2 for i in range(3)) ** 0.5
                if best is None or res < best[0]:
                    best = (res, t, ink)

            res, t, ink = best
            if res > MAX_RESIDUAL or t < T_FLOOR:
                continue  # Hintergrund bzw. JPEG-Rauschen -> bleibt transparent
            if t > T_CEIL:
                t = 1.0
            dst[x, y] = (ink[0], ink[1], ink[2], int(round(t * 255)))

    # Auf das Motiv beschneiden: im Original sitzt es unsymmetrisch
    # (Rand oben 202 px, unten 290 px) und waere sonst ueberall schief.
    bbox = out.getbbox()
    out = out.crop(bbox)
    out.save(out_path, "PNG", optimize=True)
    print(f"{out_path}: {out.size[0]}x{out.size[1]} (Quelle {w}x{h}, bbox {bbox})")


if __name__ == "__main__":
    matte(SRC, OUT)
