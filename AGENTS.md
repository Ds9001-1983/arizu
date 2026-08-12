<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Projektregeln ARIZU

### Nicht anfassen ohne Grund
- `lib/business.ts` ist die **einzige** Quelle für Name, Adresse, Telefon und
  E-Mail. Nichts davon hart in Komponenten oder JSON-LD schreiben — sonst
  laufen NAP-Angaben auseinander und Google wertet das als Inkonsistenz.
- Alle Preiswerte in `lib/pricing/` tragen `VERIFY`-Kommentare mit der
  Recherchequelle. Werte ändern heißt: Kommentar mitziehen und
  `npm run check:pricing` laufen lassen — der Test prüft gegen Marktbelege.
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
