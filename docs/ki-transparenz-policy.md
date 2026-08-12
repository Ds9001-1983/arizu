# KI-Transparenz-Policy — ARIZU Gebäudedienstleistungen

Stand: 12.08.2026
Rechtsgrundlage: Art. 50 Verordnung (EU) 2024/1689 (EU AI Act), gültig ab 02.08.2026

---

## 1. Wo wir KI einsetzen

- **Website-Chatbot:** nein. Auf der Website gibt es keinen KI-Assistenten und
  keinen Chat. Anfragen laufen über Formular, Telefon oder WhatsApp — immer
  direkt an einen Menschen.
- **KI-generierte Bilder:** ja. Fünf Bilder auf der Website wurden mit KI
  erzeugt (Hero-Bild sowie je ein Bild für Objektbetreuung,
  Gebäudereinigung, Gartenpflege und Entrümpelung). Grund: Der Betrieb startet
  gerade, es existieren noch keine eigenen Aufnahmen von Einsätzen.
- **KI-gestützte Texte:** ja, als Hilfsfunktion bei Formulierung und
  Korrektur. Inhaltlich verantwortlich ist der Inhaber; die Leistungs- und
  Preisangaben sind fachlich geprüft.

## 2. Wie wir kennzeichnen

- **Fotorealistische KI-Bilder** mit realen Motiven tragen ein sichtbares
  Badge „✦ KI-generiert" direkt auf dem Bild. Das Badge ist dauerhaft
  eingeblendet, nicht wegklickbar und enthält Text — kein reines Symbol.
- **Zusätzlich maschinenlesbar:** Jede Bilddatei trägt in den XMP-Metadaten
  `DigitalSourceType = trainedAlgorithmicMedia` nach IPTC-Standard. Die
  Dateien werden bewusst unoptimiert ausgeliefert (`unoptimized`), damit
  diese Metadaten nicht durch eine Neukodierung verloren gehen.
- **Hinweis in der Datenschutzerklärung:** Abschnitt 11 nennt den KI-Einsatz
  bei Bildern und die Kennzeichnung.
- **Social Media** (ab 2027 geplant): plattformeigenes KI-Label setzen
  **und** das Badge im Asset behalten. Auf die Automatik der Plattformen
  verlassen wir uns nicht, die Erkennung ist lückenhaft.

## 3. Was wir bewusst NICHT kennzeichnen

Nicht jede KI-Nutzung ist kennzeichnungspflichtig — Überkennzeichnung entwertet
den Hinweis dort, wo er zählt:

- Werbe- und Leistungstexte auf der Website
- Icons und klar stilisierte Grafiken (z. B. das Dach-Z aus dem Logo als
  Wasserzeichen im Hero)
- KI als reine Hilfsfunktion: Rechtschreibkorrektur, Umformulierung,
  Freistellen des Logos vom Hintergrund

## 4. Zuständigkeit

- Verantwortlich für die Prüfung neuer Inhalte: Arian Aslani (Inhaber)
- Umsetzung und technische Kennzeichnung: SUPERBRAND.marketing
- Turnus: bei jedem neuen Bild-Upload, mindestens quartalsweise
- **Sobald echte Einsatzfotos vorliegen**, ersetzen sie die KI-Bilder. Danach
  entfällt für die ersetzten Motive Badge und Metadaten-Tag — das ist der
  ausdrückliche Zielzustand, nicht ein Dauerzustand.

## 5. Nachweise

- Entscheid pro Asset dokumentiert in `story-spec.json` → `assets[].ai_disclosure`
  (auch die Nein-Entscheide, als Nachweis, dass geprüft wurde)
- Badge-Screenshots aus der QA: `qa-reports/ai-disclosure/`
- Metadaten-Prüfung reproduzierbar über:
  `exiftool -T -filename -XMP-iptcExt:DigitalSourceType public/images/*.webp`
