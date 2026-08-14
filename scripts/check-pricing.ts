/* ==================================================================
   Gegenrechnung der Konfiguratoren — bewusst ohne Test-Framework, damit es
   mit `npx tsx scripts/check-pricing.ts` überall läuft.

   Geprüft wird:
   1. das Beispiel aus dem Kundengespräch (60 m², 3. OG, 30 km Anfahrt),
   2. dass die Marktrecherche-Belege reproduziert werden,
   3. Grenzwerte (Minimum, Maximum, alle Extras),
   4. dass jeder Konfigurator mit seinen Defaults einen plausiblen Wert liefert,
   5. dass Sätze und Pflegeoberfläche zusammenpassen und jeder Satz wirkt.

   WICHTIG, seit Arian Preise selbst ändern kann (14.08.2026): Geprüft werden
   ausschließlich die CODE-STANDARDS aus `spec.defaultRates`. Die
   Überschreibungen, die Arian unter /intern/preise einträgt, sind bewusst
   ungeprüft — sie haben keine Recherchequelle, gegen die man sie halten
   könnte, und der Auftraggeber hat sich ausdrücklich gegen Warn- und
   Grenzwertlogik entschieden. Dieses Skript sagt also: "Der
   Auslieferungszustand ist marktgerecht", nicht: "Was gerade auf der Seite
   steht, ist marktgerecht". Die Datenbank wird hier nie angefasst.
   ================================================================== */

import {
  configurators,
  defaultValues,
  estimateRange,
  euro,
  gross,
  resolveRates,
} from "../lib/pricing";
import type { ConfiguratorSpec, Rates, Values } from "../lib/pricing/types";

let failed = 0;

function check(label: string, ok: boolean, detail: string) {
  const mark = ok ? "  ok  " : " FAIL ";
  if (!ok) failed++;
  console.log(`[${mark}] ${label}${detail ? ` — ${detail}` : ""}`);
}

function run(spec: ConfiguratorSpec, patch: Values = {}, rates?: Rates) {
  const v = { ...defaultValues(spec), ...patch };
  const r = spec.calc(v, rates ?? spec.defaultRates);
  const g = gross(r.net);
  const range = estimateRange(g);
  return { ...r, grossValue: g, range };
}

function between(n: number, lo: number, hi: number) {
  return n >= lo && n <= hi;
}

console.log("\n=== 1. Beispiel aus dem Kundengespräch ===");
{
  // Dennis am 12.08.2026: 60 m², dritter Stock, 30 km Anfahrt.
  const r = run(configurators.entruempelung, {
    flaeche: 60,
    fuellgrad: "normal",
    zugang: "og35",
    anfahrt: 30,
    extras: [],
  });
  // Erwartet: 60 × (20 + 5) = 1500 netto, + 10 km über der Freigrenze × 0,90 = 9
  console.log(
    `  60 m², 3. OG, 30 km: netto ${euro(r.net)}, brutto ${euro(r.grossValue)}, ` +
      `Spanne ${euro(r.range.low)}–${euro(r.range.high)} (${r.unit})`,
  );
  check("Nettobetrag entspricht Handrechnung 1509 €", Math.abs(r.net - 1509) < 0.5, `${r.net.toFixed(2)}`);
  check("Brutto = netto × 1,19", Math.abs(r.grossValue - r.net * 1.19) < 0.01, "");
  check("Spanne umschließt den Rechenwert", r.range.low <= r.grossValue && r.grossValue <= r.range.high, "");
}

console.log("\n=== 2. Marktbelege reproduzieren ===");
{
  // Recherche: 90 m² normal möbliert, guter Zugang ≈ 20 €/m² → ca. 1.800 € netto
  const a = run(configurators.entruempelung, {
    flaeche: 90, fuellgrad: "normal", zugang: "eg_aufzug", anfahrt: 0, extras: [],
  });
  check("90 m² normal / guter Zugang ≈ 1.800 € netto", Math.abs(a.net - 1800) < 1, euro(a.net));

  // Recherche: dieselbe Wohnung, 5. OG ohne Aufzug, stark vermüllt ≈ 50 €/m² = 4.500 €
  const b = run(configurators.entruempelung, {
    flaeche: 90, fuellgrad: "messie", zugang: "og35", anfahrt: 0, extras: [],
  });
  check(
    "90 m² Messie / 5. OG bleibt unter dem Marktwert 4.500 € (Minimum-Ansatz)",
    between(b.net, 3000, 4500),
    `${euro(b.net)} = ${(b.net / 90).toFixed(0)} €/m²`,
  );

  // Recherche Unterhaltsreinigung: 0,80–1,50 €/m² netto pro Einsatz
  const c = run(configurators.gebaeudereinigung, {
    flaeche: 500, art: "unterhalt", turnus: "woche1", extras: [],
  });
  const perVisit = c.net / 4.33;
  check(
    "Unterhaltsreinigung liegt bei 0,80–1,50 €/m² pro Einsatz",
    between(perVisit / 500, 0.8, 1.5),
    `${(perVisit / 500).toFixed(2)} €/m²`,
  );

  // Recherche Gartenpflege: 300–500 m² regelmäßig ≈ 150–300 € im Monat
  const d = run(configurators.gartenpflege, {
    rasenflaeche: 400, beetflaeche: 40, leistungen: ["rasen", "beetpflege"],
    hecke: 0, einmalig: [], entsorgung: "mitnehmen", turnus: "zweiwoechentlich",
  });
  check(
    "400 m² Garten, 14-tägig ≈ 150–300 €/Monat netto",
    between(d.net, 150, 300),
    `${euro(d.net)} ${d.unit}`,
  );

  // Rasenmähen muss im Marktkorridor 0,10–0,15 €/m² landen
  const d2 = run(configurators.gartenpflege, {
    rasenflaeche: 1000, beetflaeche: 0, leistungen: ["rasen"], hecke: 0,
    einmalig: [], entsorgung: "vorort", turnus: "einmalig",
  });
  check(
    "Rasenmähen liegt bei 0,10–0,15 €/m²",
    between(d2.net / 1000, 0.1, 0.15),
    `${(d2.net / 1000).toFixed(3)} €/m²`,
  );

  // Heckenschnitt darf NICHT im Monatspreis stecken, sondern als Einmalposten
  const d3 = run(configurators.gartenpflege, {
    rasenflaeche: 400, beetflaeche: 40, leistungen: ["rasen"], hecke: 50,
    einmalig: [], entsorgung: "mitnehmen", turnus: "zweiwoechentlich",
  });
  check(
    "Heckenschnitt läuft als Einmalposten, nicht im Monatspreis",
    d3.oneOffNet === 50 * 3.5 && between(d3.net, 150, 300),
    `Monat ${euro(d3.net)} + einmalig ${euro(d3.oneOffNet ?? 0)}`,
  );

  // Recherche Objektbetreuung: 15–40 € pro Wohneinheit und Monat
  const e = run(configurators.objektbetreuung, { einheiten: 8, objektart: "mfh" });
  check(
    "Objektbetreuung liegt bei 15–40 € pro Einheit und Monat",
    between(e.net / 8, 15, 40),
    `${(e.net / 8).toFixed(2)} €/WE`,
  );
  // Recherche: kleine Objekte 5–10 Einheiten ≈ 200–400 €/Monat
  check("8 Einheiten ≈ 200–400 €/Monat", between(e.net, 150, 400), euro(e.net));
}

console.log("\n=== 3. Grenzwerte ===");
for (const [name, spec] of Object.entries(configurators)) {
  const lows: Values = {};
  const highs: Values = {};
  for (const f of spec.fields) {
    if (f.kind === "number") {
      lows[f.id] = f.min;
      highs[f.id] = f.max;
    } else if (f.kind === "checkboxes") {
      lows[f.id] = [];
      highs[f.id] = f.options.map((o) => o.id);
    }
  }
  const lo = run(spec, lows);
  const hi = run(spec, highs);
  check(
    `${name}: Minimum greift Mindestauftragswert`,
    lo.net >= (spec.defaultRates.mindestauftrag ?? 0),
    euro(lo.net),
  );
  check(`${name}: Maximum bleibt endlich und positiv`, Number.isFinite(hi.net) && hi.net > lo.net, euro(hi.net));
  check(`${name}: Spanne ist aufsteigend`, hi.range.low < hi.range.high, `${euro(hi.range.low)}–${euro(hi.range.high)}`);
}

console.log("\n=== 4. Defaults ===");
for (const [name, spec] of Object.entries(configurators)) {
  const r = run(spec);
  check(
    `${name}: Startwert plausibel (50–2000 € brutto)`,
    between(r.grossValue, 50, 2000),
    `${euro(r.grossValue)} ${r.unit}`,
  );
  check(`${name}: liefert mindestens einen Hinweis`, r.notes.length > 0, `${r.notes.length}`);
}

console.log("\n=== 5. Sätze und Pflegeoberfläche ===");
for (const [name, spec] of Object.entries(configurators)) {
  const satzKeys = Object.keys(spec.defaultRates).sort();
  const feldKeys = spec.rateFields.map((f) => f.key).sort();

  // Fängt beides: einen Satz, den Arian gar nicht bearbeiten kann, und ein
  // Eingabefeld, das ins Leere zeigt.
  check(
    `${name}: jeder Satz hat genau ein Eingabefeld`,
    satzKeys.join("|") === feldKeys.join("|"),
    `${satzKeys.length} Sätze, ${feldKeys.length} Felder`,
  );

  // Ohne Überschreibung muss exakt das Verhalten von vorher herauskommen.
  check(
    `${name}: ohne Überschreibung gelten die Code-Standards`,
    JSON.stringify(resolveRates(spec, [])) === JSON.stringify(spec.defaultRates),
    "",
  );

  /* Der wichtigste Test des ganzen Umbaus: Wirkt sich jeder Satz überhaupt
     aus? Wird beim Umstellen eine Stelle übersehen und liest weiter die alte
     Modulkonstante, stimmen sämtliche Prüfungen oben trotzdem — nur Arians
     Änderung bliebe wirkungslos, und niemand fände den Grund. Deshalb wird
     jeder Satz verdoppelt und über eine kleine Matrix gerechnet: Defaults,
     alle Minima, alle Maxima und jede Auswahloption einzeln. */
  const matrix: Values[] = [{}];
  const alleAn: Values = {};
  const alleAus: Values = {};
  for (const f of spec.fields) {
    if (f.kind === "number") {
      alleAus[f.id] = f.min;
      alleAn[f.id] = f.max;
    } else if (f.kind === "checkboxes") {
      alleAus[f.id] = [];
      alleAn[f.id] = f.options.map((o) => o.id);
    }
  }
  matrix.push(alleAus, alleAn);
  for (const f of spec.fields) {
    if (f.kind !== "select") continue;
    for (const o of f.options) matrix.push({ ...alleAn, [f.id]: o.id });
  }

  const nurKalkulation = new Set(
    spec.rateFields.filter((f) => f.nurKalkulation).map((f) => f.key),
  );
  const wirkungslos = satzKeys.filter((key) => {
    if (nurKalkulation.has(key)) return false;
    const veraendert: Rates = { ...spec.defaultRates, [key]: spec.defaultRates[key] * 2 + 1 };
    return !matrix.some((v) => {
      const a = run(spec, v);
      const b = run(spec, v, veraendert);
      return a.net !== b.net || (a.oneOffNet ?? 0) !== (b.oneOffNet ?? 0);
    });
  });
  check(
    `${name}: jeder Satz wirkt sich auf den Preis aus`,
    wirkungslos.length === 0,
    wirkungslos.length ? `ohne Wirkung: ${wirkungslos.join(", ")}` : `${satzKeys.length} geprüft`,
  );
}

console.log(
  failed === 0
    ? "\nAlle Prüfungen bestanden.\n"
    : `\n${failed} Prüfung(en) fehlgeschlagen.\n`,
);
process.exit(failed === 0 ? 0 : 1);
