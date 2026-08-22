# KI-Transparenz-Policy — ARIZU Gebäudedienstleistungen

Stand: 22.08.2026
Rechtsgrundlage: Art. 50 Verordnung (EU) 2024/1689 (EU AI Act), gültig ab 02.08.2026

---

## 1. Wo wir KI einsetzen

- **Website-Chatbot:** nein. Auf der Website gibt es keinen KI-Assistenten und
  keinen Chat. Anfragen laufen über Formular, Telefon oder WhatsApp — immer
  direkt an einen Menschen.
- **KI-generierte Bilder und Videos:** ja. Sechs fotorealistische Motive auf
  der Website wurden mit KI erzeugt (Gebäude-Hero, Privatgarten-Hero sowie je
  ein Bild für Objektbetreuung, Gebäudereinigung, Gartenpflege und
  Entrümpelung). Grund: Der Betrieb startet gerade, es existieren noch keine
  eigenen Aufnahmen von Einsätzen.
- **Inhaberporträt auf der Kontaktseite:** nein, nicht mehr. Bis zum
  21.08.2026 war dort ein KI-Porträt zu sehen; seit dem 22.08.2026 steht dort
  ein echtes Shooting-Foto. Badge und Metadaten-Tag sind damit entfallen
  (siehe Abschnitt 4).
- **KI-gestützte Texte:** ja, als Hilfsfunktion bei Formulierung und
  Korrektur. Inhaltlich verantwortlich ist der Inhaber; die Leistungs- und
  Preisangaben sind fachlich geprüft.

## 2. Wie wir kennzeichnen

- **Fotorealistische KI-Medien** mit realen Motiven tragen ein sichtbares
  Badge „✦ KI-generiert" direkt auf dem Bild oder Video. Das Badge ist dauerhaft
  eingeblendet, nicht wegklickbar und enthält Text — kein reines Symbol.
- **Zusätzlich maschinenlesbar:** Jede Bild- und Videodatei trägt in den XMP-Metadaten
  `DigitalSourceType = trainedAlgorithmicMedia` nach IPTC-Standard. Die
  Dateien werden bewusst unoptimiert ausgeliefert (`unoptimized`), damit
  diese Metadaten nicht durch eine Neukodierung verloren gehen.
- **Hinweis in der Datenschutzerklärung:** Abschnitt 11 nennt den KI-Einsatz
  bei Bildern und Videos sowie die Kennzeichnung.
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
- Turnus: bei jedem neuen Medien-Upload, mindestens quartalsweise
- **Sobald echte Einsatzfotos vorliegen**, ersetzen sie die KI-Medien. Danach
  entfällt für die ersetzten Motive Badge und Metadaten-Tag — das ist der
  ausdrückliche Zielzustand, nicht ein Dauerzustand.
- **Bereits eingelöst:** Am 22.08.2026 hat das echte Shooting-Foto von Arian
  Aslani das KI-Porträt auf der Kontaktseite abgelöst
  (`img-arian-portrait-v3` → `img-arian-portrait-foto`). Das KI-Motiv bleibt
  als abgelöste Fassung im story-spec dokumentiert, wird aber nicht mehr
  ausgeliefert. Am echten Foto wäre eine KI-Kennzeichnung eine
  Falschauskunft — sie wurde deshalb bewusst entfernt, nicht vergessen.

## 5. Nachweise

- Entscheid pro Asset dokumentiert in `story-spec.json` → `assets[].ai_disclosure`
  (auch die Nein-Entscheide, als Nachweis, dass geprüft wurde)
- Badge-Screenshots aus der QA: `qa-reports/ai-disclosure/`
- Metadaten-Prüfung reproduzierbar über:
  `exiftool -T -filename -XMP-iptcExt:DigitalSourceType public/images/*.webp public/video/*.mp4`
