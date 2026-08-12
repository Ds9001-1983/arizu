#!/usr/bin/env python3
"""
Buchstaben-Geometrie aus dem freigestellten Original ausmessen.

Zweck: Beim Montserrat-Nachbau soll Arians Sperrung und Groesse 1:1 erhalten
bleiben — getauscht werden nur die Buchstabenformen. Dafuer brauche ich pro
Buchstabe die Bounding-Box aus dem Original.

Vorgehen:
1. Navy-Pixel definieren das Versalband (cap_top..cap_bottom). Die Dachkontur
   liegt komplett oberhalb davon und stoert so nicht.
2. Innerhalb des Bands alle Tinte spaltenweise projizieren und an den Luecken
   in Buchstabengruppen schneiden (A R I Z U).
3. Gold oberhalb cap_top = Dach -> separate Maske, wird eigenstaendig getract,
   weil dieses Element nicht aus einer Schrift kommt.
"""

import json
from PIL import Image

NAVY = (11, 26, 47)
GOLD = (201, 155, 70)
ALPHA_MIN = 64  # unter diesem Deckungsgrad zaehlt ein Pixel nicht als Tinte


def main() -> None:
    im = Image.open("logo-arizu.png").convert("RGBA")
    w, h = im.size
    px = im.load()

    navy_cols, gold_cols = {}, {}
    navy_rows = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < ALPHA_MIN:
                continue
            if (r, g, b) == NAVY:
                navy_cols.setdefault(x, []).append(y)
                navy_rows.append(y)
            elif (r, g, b) == GOLD:
                gold_cols.setdefault(x, []).append(y)

    cap_top, cap_bottom = min(navy_rows), max(navy_rows)
    print(f"Versalband: y {cap_top}..{cap_bottom}  (Versalhoehe {cap_bottom - cap_top + 1} px)")

    # Spalten mit Tinte INNERHALB des Versalbands (Navy + Gold)
    band = set()
    for x in range(w):
        for src in (navy_cols, gold_cols):
            if any(cap_top <= y <= cap_bottom for y in src.get(x, ())):
                band.add(x)
                break

    # Zusammenhaengende Spaltengruppen = Buchstaben
    groups, start, prev = [], None, None
    for x in sorted(band):
        if start is None:
            start, prev = x, x
        elif x - prev > 6:  # Luecke -> neuer Buchstabe
            groups.append((start, prev))
            start = x
        prev = x
    if start is not None:
        groups.append((start, prev))

    letters = "ARIZU"
    print(f"\n{len(groups)} Gruppen gefunden (erwartet 5):")
    out = {"capTop": cap_top, "capBottom": cap_bottom, "width": w, "height": h, "letters": []}
    for i, (x0, x1) in enumerate(groups):
        ys = []
        colour = "navy"
        for x in range(x0, x1 + 1):
            ys += [y for y in navy_cols.get(x, ()) if cap_top <= y <= cap_bottom]
            gy = [y for y in gold_cols.get(x, ()) if cap_top <= y <= cap_bottom]
            if gy:
                ys += gy
                colour = "gold"
        name = letters[i] if i < len(letters) else f"?{i}"
        rec = {
            "char": name,
            "x0": x0,
            "x1": x1,
            "width": x1 - x0 + 1,
            "top": min(ys),
            "bottom": max(ys),
            "colour": colour,
        }
        out["letters"].append(rec)
        print(
            f"  {name}: x {x0:4d}..{x1:4d} (b={rec['width']:3d})  "
            f"y {rec['top']:3d}..{rec['bottom']:3d}  {colour}"
        )

    # Abstaende zwischen den Buchstaben (Sperrung)
    print("\nAbstaende (rechte Kante -> naechste linke Kante):")
    ls = out["letters"]
    for a, b in zip(ls, ls[1:]):
        print(f"  {a['char']}->{b['char']}: {b['x0'] - a['x1'] - 1} px")

    # Dachmaske: Gold oberhalb des Versalbands
    roof = Image.new("L", (w, h), 0)
    rp = roof.load()
    n = 0
    for x, ys in gold_cols.items():
        for y in ys:
            if y < cap_top:
                rp[x, y] = 255
                n += 1
    bbox = roof.getbbox()
    print(f"\nDach: {n} Pixel, bbox {bbox}")
    big = roof.resize((w * 3, h * 3), Image.LANCZOS)
    big.point(lambda v: 0 if v >= 128 else 255).convert("1").save("mask-roof.pbm")
    out["roofBox"] = bbox
    json.dump(out, open("letter-metrics.json", "w"), indent=2)
    print("-> letter-metrics.json, mask-roof.pbm")


if __name__ == "__main__":
    main()
