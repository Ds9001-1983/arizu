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
| `npm run db:init` | Tabellen `leads` und `preise` in Neon anlegen (idempotent) |
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

Die Seite ist als Prototyp fertig, aber **nicht veröffentlichungsreif**. Offen:

1. **Impressum** — Straße und USt-IdNr./Steuernummer fehlen. Ohne diese
   Angaben ist die Seite nach § 5 DDG abmahnfähig. Die Rechtsseiten zeigen
   die Lücken rot markiert und mit Warnhinweis.
2. **AGB** — nur Entwurf, auf `noindex`. Anwaltlich prüfen lassen,
   insbesondere Stornopauschale (§ 309 Nr. 5 BGB) und Widerrufsrecht.
3. **Preise bestätigen** — jeder Wert steht in `defaultRates` der Specs unter
   `lib/pricing/` und ist mit `VERIFY` markiert. Grundlage ist Marktrecherche
   von 08/2026, angesetzt jeweils der untere Rand. `npm run check:pricing`
   prüft die Werte gegen die Belege.
4. **Mailversand** — es gibt noch keine SMTP-Zugangsdaten, deshalb läuft der
   Demo-Modus: Anfragen landen in der Datenbank und unter `/intern`, aber es
   geht keine Mail raus, weder an Arian noch als Bestätigung an den Kunden.
5. **DMARC fehlt** — SPF und DKIM stehen seit dem 14.08.2026, ein
   `_dmarc`-Eintrag nicht. Ohne ihn bleibt die Domain für Absender-Fälschung
   offener als nötig.
6. **Zweitdomain `arizu.de`** — noch nicht registriert, soll später per
   Redirect auf die Hauptdomain zeigen.
7. **Google Business Profile** — vorbereiten, Verifizierung braucht Arian.

### Erledigt

**Domain** `arizu-gebaeudedienstleistungen.de` läuft seit dem 14.08.2026 bei
Hetzner. `A @` und `CNAME www` zeigen auf Vercel, der nackte Name leitet per
308 auf `www`. **MX, SPF, DKIM, die SRV-Einträge und `autoconfig` sind beim
Mailhost geblieben** — der Mailverkehr hängt daran. Beim SPF war eine
Anpassung nötig: `+a` autorisierte nach dem Umzug Vercels Webserver zum
Mailversand, jetzt steht dort `v=spf1 +mx ~all`.

## Bilder und KI-Kennzeichnung

Es existieren noch keine echten Einsatzfotos, deshalb sind fünf Bilder
KI-generiert. Alle tragen ein sichtbares Badge „✦ KI-generiert" **und** den
IPTC-Metadatensatz `DigitalSourceType = trainedAlgorithmicMedia`. Details und
die Entscheidung pro Asset: `docs/ki-transparenz-policy.md` und
`story-spec.json` → `assets[].ai_disclosure`.

Deshalb ist die Next-Bildoptimierung projektweit aus (`next.config.ts`): Der
Optimizer re-encodiert und würde die Metadaten verwerfen. Die Dateien liegen
bereits als WebP in Zielgröße vor.

**Sobald Arian echte Fotos schickt**, ersetzen sie die KI-Bilder in
`public/images/`; Badge und Metadaten-Tag entfallen dann für das jeweilige
Motiv.

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
