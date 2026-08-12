#!/usr/bin/env python3
"""
Aus dem freigestellten Logo je Tintenfarbe eine Bilevel-Maske fuer potrace bauen.

Das Matting hat jedem Pixel bereits die reine Tintenfarbe zugewiesen, die
Deckung steckt im Alpha. Pro Farbe wird daher nur das Alpha der zugehoerigen
Pixel extrahiert.

Vor dem Schwellwert wird 3x hochskaliert (LANCZOS): potrace arbeitet bilevel,
und eine glattere, hoeher aufgeloeste Kante liefert deutlich sauberere
Bezier-Fits als das harte Treppenmuster der Originalaufloesung.
"""

import sys
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "logo-arizu.png"
SCALE = 3

INKS = {"navy": (11, 26, 47), "gold": (201, 155, 70)}


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    px = im.load()

    for name, ink in INKS.items():
        mask = Image.new("L", (w, h), 0)
        mp = mask.load()
        count = 0
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a and (r, g, b) == ink:
                    mp[x, y] = a
                    count += 1

        big = mask.resize((w * SCALE, h * SCALE), Image.LANCZOS)
        # PBM erwartet 1 = schwarz; potrace tracet die schwarzen Flaechen.
        bilevel = big.point(lambda v: 0 if v >= 128 else 255).convert("1")
        out = f"mask-{name}.pbm"
        bilevel.save(out)
        print(f"{out}: {bilevel.size[0]}x{bilevel.size[1]}, {count} Quellpixel")


if __name__ == "__main__":
    main()
