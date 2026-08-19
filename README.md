# ARIZU Gebäudedienstleistungen — Website

Kundenprojekt für Arian Aslani, Elmshorn. Gebäudereinigung, Gartenpflege,
Objektbetreuung, Entrümpelung. Kern des Projekts sind die vier
**Preis-Konfiguratoren**: Der Besucher sieht einen Richtpreis, bevor er
Kontaktdaten abgibt — der stärkste Wettbewerber im Umkreis (Makur
Gebäudedienst, ebenfalls Elmshorn) wirbt mit „Angebot in 60 Sekunden",
liefert aber nur ein Formular ohne Preis.

## Stack

Next.js 16.2.7 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
Archivo + Manrope · nodemailer (SMTP) · Neon Postgres · Playwright

## Schnellstart

```bash
npm install
cp .env.example .env.local     # optional, siehe unten
npm run dev
```

Die Seite läuft **ohne jede Umgebungsvariable**: ohne SMTP greift der
Mail-Demo-Modus (Logging), ohne `DATABASE_URL` gehen Leads nur per Mail,
ohne Admin-Hash bleibt `/intern` gesperrt.

## Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktionsbuild |
| `npm run lint` | ESLint |
| `npm run check:pricing` | Rechnet die Konfiguratoren gegen Marktbelege und Grenzwerte nach |
| `npm run qa` | Playwright: KI-Kennzeichnung, Konfigurator, Geschäftskunden, Formular, Zugangsschutz |
| `npm run qa:ai` | Nur der Pflicht-Check der KI-Kennzeichnung |
| `npm run db:init` | Tabellen `leads`, `preise` und `kundenart_auswahl` in Neon anlegen (idempotent) |
| `npm run hash:password "…"` | Passwort-Hash für `/intern` erzeugen |

> **`npm run qa` schickt echte Anfragen durch die Formulare.** Deshalb gibt es
> zwei Neon-Datenbanken, beide in Frankfurt: `arizu-leads-eu` für die
> Produktion und `arizu-test-eu` für Vorschau-Deployments und die lokale
> Entwicklung. Testzeilen landen damit nie in Arians Anfragenliste, und eine
> Preisänderung aus einer Vorschau wirkt nicht auf die Live-Seite.

## Struktur

```
app/
  page.tsx                  Startseite, mit Weiche privat/geschäftlich
  privatkunden/             Leistungen, Richtpreis-Konfiguratoren und Anfrage
  leistungen/[slug]/        4 Leistungsseiten (statisch)
  geschaeftskunden/         B2B-Bereich: Bedarfsabfrage ohne Richtpreis
  kontakt/                  Kontaktseite
  intern/                   Lead-Inbox und Preispflege, per proxy.ts geschützt
  api/lead/                 Lead-Annahme (Node-Runtime)
  llms.txt/                 GEO-Datei für ChatGPT, Perplexity, Gemini
lib/
  business.ts               Single Source of Truth für NAP-Daten
  services.ts               Leistungskatalog, 38 Einzelleistungen aus dem Flyer
  b2b.ts                    Kataloge des Geschäftskundenbereichs, kein Preis
  pricing/                  Preislogik je Leistung, alle Werte VERIFY-markiert
  rates-server.ts           Lädt Arians Preisüberschreibungen (nur serverseitig)
  seo.ts                    JSON-LD-Bausteine
  mail.ts · db.ts · auth.ts
components/
  site/                     Layout und Seitenbausteine
  ai/                       KI-Kennzeichnung (Art. 50 EU AI Act)
scripts/logo/               Logo-Pipeline, reproduzierbar
assets-source/              Arians Originaldateien + KI-Master mit Metadaten
qa-reports/                 Lighthouse + Badge-Belegscreenshots
story-spec.json             Projektspezifikation, gegen SUPERBRAND-Schema validiert
```

## Vor dem Live-Gang

Die Seite ist online, aber noch nicht in jedem Punkt abgeschlossen. Offen:

1. **Auftragsverarbeitungsverträge nach Art. 28 DSGVO** — mit Vercel (im
   Regelwerk enthalten, muss aber im Konto bestätigt werden), mit Hetzner
   (im Kundenmenü abzuschließen) und für die Neon-Datenbank, die über den
   Vercel-Marktplatz bezogen wird. Das sind Pflichten des Verantwortlichen,
   keine Angabe auf der Website — deshalb stehen sie hier und nicht mehr in
   der Datenschutzerklärung.
2. **Rechtstexte anwaltlich prüfen lassen** — die Datenschutzerklärung ist
   inhaltlich vollständig und beschreibt den gemessenen Ist-Zustand, die
   abschließende juristische Bewertung ersetzt das nicht. Bei den **AGB** ist
   es dringender: Sie sind nur ein Entwurf auf `noindex` und haben neun offene
   Stellen (Zahlungsziel, Stornofrist, Anzahlungsgrenze, Versicherer). Kritisch
   sind Stornopauschale (§ 309 Nr. 5 BGB) und Widerrufsrecht.
3. **Stammdaten prüfen** — die Postleitzahl 25337 stammt aus dem
   Designentwurf und ist nie gegen „Am Dornbusch 17“ abgeglichen worden
   (Elmshorn hat drei). Ebenso ungeprüft: Öffnungszeiten und Rechtsform.
   Alle mit `VERIFY` in `lib/business.ts` markiert.
4. **Google Business Profile** — vorbereiten, Verifizierung braucht Arian.
   Vorher die Koordinaten präzisieren, sie zeigen auf den Ortsmittelpunkt.
5. **Zweitdomain `arizu.de`** und **DMARC** — laufen bei Dennis parallel.

### Erledigt

**Domain** `arizu-gebaeudedienstleistungen.de` läuft seit dem 14.08.2026 bei
Hetzner. `A @` und `CNAME www` zeigen auf Vercel, der nackte Name leitet per
308 auf `www`. **MX, SPF, DKIM, die SRV-Einträge und `autoconfig` sind beim
Mailhost geblieben** — der Mailverkehr hängt daran. Beim SPF war eine
Anpassung nötig: `+a` autorisierte nach dem Umzug Vercels Webserver zum
Mailversand, jetzt steht dort `v=spf1 +mx ~all`.

**Mailversand** läuft über Hetzner, nachgewiesen am 14.08.2026 mit echten
Anfragen über beide Wege. SMTP ist ausschließlich in Vercel gesetzt; lokal
bleibt der Demo-Modus, weil `npm run qa` sonst bei jedem Lauf echte Mails
verschicken würde.

**Kein Cookie-Banner nötig**, und das ist gemessen statt angenommen: Ein
Browserlauf über Startseite, Leistungsseite, Geschäftskundenbereich, Kontakt
und Datenschutz samt Bedienung des Konfigurators kontaktierte **keinen
einzigen fremden Host**, setzte **keinen Cookie** und ließ `localStorage`
wie `sessionStorage` leer. Nach § 25 TDDDG ist eine Einwilligung nur nötig,
wenn auf dem Endgerät gespeichert oder ausgelesen wird — hier passiert
beides nicht. Schriften und die Hero-Videos liegen selbst gehostet, es gibt
keine eingebetteten Karten oder Plugins. Die Startseiten-Weiche erhöht nur
einen von zwei anonymen Summenzählern (Privat-/Geschäftskunde): kein einzelnes
Ereignis, kein Zeitpunkt, keine IP-Adresse, keine Gerätekennung und kein
Nutzerprofil werden in der Anwendung gespeichert.

Wer daran etwas ändert — personenbezogene Analytics, Google Fonts, eine
eingebettete Karte oder Vercel Speed Insights —, muss Cookie-/Einwilligungsfrage
und Datenschutzerklärung neu bewerten. Die Messung lässt sich mit einem
Playwright-Lauf wiederholen.

## Bilder und KI-Kennzeichnung

Es existieren noch keine echten Einsatzfotos, deshalb sind sechs fotorealistische
Einsatzmotive KI-generiert. Alle Bilder und Videos tragen ein sichtbares Badge
„✦ KI-generiert" **und** den IPTC-Metadatensatz
`DigitalSourceType = trainedAlgorithmicMedia`. Details und
die Entscheidung pro Asset: `docs/ki-transparenz-policy.md` und
`story-spec.json` → `assets[].ai_disclosure`.

Das Porträt auf der Kontaktseite ist ein echtes Foto von Arian; KI wurde dort
nur assistiv für Kontrast und Bildqualität eingesetzt. Es ist deshalb als
`assistive_edit_exempt` dokumentiert und trägt kein KI-Badge.

Deshalb ist die Next-Bildoptimierung projektweit aus (`next.config.ts`): Der
Optimizer re-encodiert und würde die Metadaten verwerfen. Die Dateien liegen
bereits als WebP in Zielgröße vor.

**Sobald Arian echte Fotos schickt**, ersetzen sie die KI-Medien in
`public/images/` und `public/video/`; Badge und Metadaten-Tag entfallen dann
für das jeweilige Motiv.

## Messwerte (12.08.2026, Produktionsbuild)

| | Desktop | Mobil |
|---|---|---|
| Performance | 100 | 91 |
| Accessibility | 100 | 100 |
| SEO | 100 | 100 |
| Best Practices | 100 | 100 |
| LCP | 0,8 s | 3,5 s |
| CLS | 0 | 0 |

Der mobile LCP von 3,5 s ist Lighthouse' simulierte 4G-Projektion — im
unthrottled Trace sind alle Requests nach 90 ms fertig. Initial-JS liegt bei
182 KB gegen ein Budget von 150 KB; der Rest ist React selbst. Weiter drücken
ließe sich das nur, indem der Konfigurator per `next/dynamic` nachgeladen wird
— dann steht er aber nicht mehr im HTML und fällt für GEO weg. Bewusst nicht
gemacht.

---

Made with ❤️ by [SUPERBRAND.marketing](https://superbrand.marketing) — Dein
Superheld für deine Werbung.
