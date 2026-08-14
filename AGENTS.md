<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Projektregeln ARIZU

### Nicht anfassen ohne Grund
- `lib/business.ts` ist die **einzige** Quelle für Name, Adresse, Telefon und
  E-Mail. Nichts davon hart in Komponenten oder JSON-LD schreiben — sonst
  laufen NAP-Angaben auseinander und Google wertet das als Inkonsistenz.
- Alle Preiswerte stehen in `defaultRates` der jeweiligen Spec in
  `lib/pricing/` und tragen `VERIFY`-Kommentare mit der Recherchequelle.
  Werte ändern heißt: Kommentar mitziehen und `npm run check:pricing` laufen
  lassen — der Test prüft gegen Marktbelege.
- Seit 14.08.2026 kann Arian dieselben Sätze unter `/intern/preise` selbst
  überschreiben. Damit gilt eine Zweiteilung, die man nicht vermischen darf:
  Die **Code-Standards** sind belegt und werden geprüft; **Arians
  Überschreibungen** in der Tabelle `preise` sind bewusst **ungeprüft** — der
  Auftraggeber hat sich ausdrücklich gegen Warn- und Grenzwertlogik
  entschieden. `check:pricing` sagt also „der Auslieferungszustand ist
  marktgerecht", nicht „was gerade auf der Seite steht".
  Hier bitte keine Mindestlohn- oder Marktprüfung nachrüsten, ohne das
  vorher abzustimmen.
- Editierbar ist, was in **Euro** ausgedrückt ist. Rechengrößen bleiben im
  Code: Turnus-Faktoren, der Objektart-Faktor, der Einmal-Zuschlag von 20 %,
  die Spanne von −4/+18 %, die 20 Freikilometer und der MwSt.-Satz.
- `calc` bekommt die Sätze als **zweiten Pflichtparameter**. Kein
  Default-Wert: Ein Default machte aus einer vergessenen Aufrufstelle einen
  stillen Fehler mit alten Preisen statt eines Compilerfehlers.
- `lib/rates-server.ts` lädt die Sätze und zieht dabei `lib/db` herein. Die
  Datei liegt bewusst **außerhalb** von `lib/pricing/` und wird dort nie
  re-exportiert, sonst landet der Neon-Treiber im Client-Bundle. Gegenprobe:
  `grep -r neondatabase .next/static/chunks` darf nichts finden.
- Die Preisänderungen werden über die vier **konkreten** Leistungspfade
  revalidiert, nie über `revalidatePath("/leistungen/[slug]", "page")` —
  siehe Kommentar in `app/intern/actions.ts`.
- Bildoptimierung bleibt aus (`next.config.ts`). Grund steht dort: der
  Optimizer verwirft die KI-Kennzeichnungs-Metadaten.

### KI-Kennzeichnung ist Pflicht, nicht Kür
Jedes neue fotorealistische KI-Bild braucht dreierlei, sonst schlägt
`npm run qa:ai` fehl:
1. Eintrag in `story-spec.json` unter `assets[]` mit `ai_disclosure`
2. sichtbares Badge über `<AiMedia assetId="…">`
3. Metadaten:
   `exiftool -overwrite_original -XMP-iptcExt:DigitalSourceType="https://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia" <datei>`

Auch Nein-Entscheide gehören ins story-spec — das ist der Nachweis, dass
geprüft wurde.

### Client-Bundle
Das Performance-Budget liegt bei 150 KB Initial-JS. `react-hook-form`, `zod`
und `@hookform/resolvers` wurden bewusst aus dem Client entfernt (waren rund
100 KB). `zod` gehört ausschließlich in `app/api/`, dort ist die
Validierungsgrenze. Keine Validierungsbibliothek in Client-Komponenten
zurückholen.

### Serialisierung über die Server/Client-Grenze
`ConfiguratorSpec` enthält `calc` als Funktion und kann **nicht** als Prop von
einer Server- in eine Client-Komponente wandern. Deshalb bekommt
`<Konfigurator>` nur den `slug` und holt die Spezifikation selbst.

### Rechtstexte
Impressum, Datenschutz und AGB zeigen offene Punkte über `<Fehlt>` rot markiert
und `todo` als Warnbanner. Diese Marker erst entfernen, wenn die Angabe
tatsächlich vorliegt — nicht, weil sie störend aussehen.
