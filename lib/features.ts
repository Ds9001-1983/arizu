/* ==================================================================
   Schalter für ganze Funktionen der Website.

   PREISRECHNER_AKTIV
   Arian wollte am 05.11.2026 vorerst keinen Preisrechner mehr auf der
   Website: Sie soll erst einmal nur Anfragen bringen. Gedacht ist das als
   Pause, nicht als Abschied. Deshalb bleibt alles stehen, was zum Rechner
   gehört: Konfigurator, Preis-Specs, `check:pricing`, Arians Sätze in der
   Tabelle `preise` und die Pflege unter /intern/preise.

   Ausgeschaltet zeigen die Leistungsseiten und die Privatkundenseite statt
   des Rechners das Anfrageformular (wie beim Hausmeisterservice), Header,
   Handy-Leiste und Texte werben nicht mehr mit einer Preisschätzung, und
   Datenschutz, AGB und Impressum lassen ihre Sätze zum Rechner weg.

   Wieder einschalten: Wert auf `true` setzen, `npm run qa` laufen lassen
   (die Rechner-Tests laufen dann wieder mit) und das lastmod der
   betroffenen Seiten in app/sitemap.ts auf das Datum setzen (Startseite,
   Privat- und Geschäftskunden, Leistungen, Impressum, Datenschutz).

   Bewusst eine Konstante im Code und keine Umgebungsvariable: Die Tests
   lesen denselben Wert, und welcher Stand live ist, steht in Git.
   ================================================================== */
export const PREISRECHNER_AKTIV = false;
