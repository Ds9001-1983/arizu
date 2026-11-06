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
- **Preisrechner seit 06.11.2026 ausgeschaltet** (Arian, 05.11.: erst einmal
  nur Anfragen). Schalter ist `PREISRECHNER_AKTIV` in `lib/features.ts`.
  Ob eine Leistung gerade einen Rechner zeigt, entscheidet
  `zeigtPreisrechner(service)` aus `lib/services.ts`, nie
  `hasPublicCalculator` allein. Texte, die den Rechner erwähnen, stehen in
  beiden Fassungen im Code (`mitRechner(an, aus)`), auch in Datenschutz,
  AGB und Impressum. Ohne Rechner hat `/privatkunden` ein eigenes
  Anfrageformular (Dennis, 06.11.2026), mit Rechner gilt wieder „kein
  zweites Formular“ (Meeting 19.08.2026). Konfigurator, Specs,
  `check:pricing` und `/intern/preise` bleiben bewusst erhalten.
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

### Einwilligung und Meta-Tracking (seit 06.11.2026)
- Vor einer Entscheidung im Banner lädt **nichts** von Meta, es entsteht kein
  Cookie und nichts im Browserspeicher. Dasselbe gilt nach „Nur notwendige“.
  `qa-tests/datenschutz.spec.ts` und `qa-tests/einwilligung.spec.ts` halten
  das fest. Schlägt dort etwas fehl, lädt etwas ohne Einwilligung, und das
  muss raus oder hinter den Banner, der Test wird nicht gelockert.
- Ein neuer Dienst, der etwas auf dem Gerät speichert oder Daten an Dritte
  schickt, braucht drei Dinge: eine Kategorie im Banner, einen Abschnitt in
  der Datenschutzerklärung und einen Test. Danach `EINWILLIGUNG_VERSION` in
  `lib/tracking/einwilligung.ts` erhöhen, damit der Banner neu fragt.
- Bannertexte ändern heißt ebenfalls Version erhöhen. Die Texte je Version
  stehen in Git. Das ist der Nachweis, welcher Text bei einer Einwilligung
  zu sehen war (DSK-OH Digitale Dienste, Rn. 84 f.).
- Die Ereignisnamen in `lib/tracking/meta.ts` (`META_EREIGNISSE`) sind die
  Schnittstelle zu den Zielgruppen im Werbeanzeigenmanager. Umbenennen nur
  zusammen mit den Zielgruppen.
- `lib/tracking/meta-server.ts` liest `META_CAPI_TOKEN` und darf nur auf dem
  Server landen (`import "server-only"`). Der Schlüssel steht im Body, nie
  in der URL, und wird nie geloggt. Gesendet wird nur in Production oder
  mit `META_TEST_EVENT_CODE`; den Testcode nie in Production setzen.
- E-Mail und Telefon gehen nur beim Lead an Meta, nur als SHA-256, nur aus
  `app/api/lead/route.ts`. Name, Anschrift und Nachricht nie.
- Die Pixel-Ereignisse in den Tests laufen gegen ein leeres `fbevents.js`.
  Kein Test darf echte Ereignisse an Meta schicken.

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
