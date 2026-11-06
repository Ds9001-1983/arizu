/* ==================================================================
   Schalter für ganze Funktionen der Website.

   PREISRECHNER_AKTIV
   Arian wollte am 05.11.2026 vorerst keinen Preisrechner mehr auf der
   Website: Sie soll erst einmal nur Anfragen bringen. Gedacht ist das als
   Pause, nicht als Abschied. Deshalb bleibt alles stehen, was zum Rechner
   gehört: Konfigurator, Preis-Specs, `check:pricing`, Arians Sätze in der
   Tabelle `preise` und die Pflege unter /intern/preise.

   Ausgeschaltet zeigen die Leistungsseiten statt des Rechners das
   Anfrageformular (wie beim Hausmeisterservice), die Privatkundenseite führt
   zum zentralen Formular auf /kontakt, und Header, Handy-Leiste und Texte
   werben nicht mehr mit einer Preisschätzung.

   Wieder einschalten: Wert auf `true` setzen, `npm run qa` laufen lassen
   (die Rechner-Tests laufen dann wieder mit) und das lastmod der
   betroffenen Seiten in app/sitemap.ts auf das Datum setzen.

   Bewusst eine Konstante im Code und keine Umgebungsvariable: Die Tests
   lesen denselben Wert, und welcher Stand live ist, steht in Git.
   ================================================================== */
export const PREISRECHNER_AKTIV = false;
