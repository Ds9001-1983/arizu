/* ==================================================================
   Leistungskatalog — Inhalte 1:1 aus Arians Designentwurf vom 12.08.2026.
   Reihenfolge, Überschriften und alle 38 Einzelleistungen sind übernommen,
   damit die Website und der Flyer dasselbe versprechen.

   Die Fließtexte (`teaser`, `body`) sind für Menschen UND für KI-Systeme
   geschrieben: jede Einzelleistung wird benannt und erklärt, statt nur als
   Stichwort gelistet. ChatGPT, Perplexity und Gemini lesen Inhalt, keine
   Keyword-Dichte — das ist der GEO-Teil des Auftrags.
   ================================================================== */

import type { ConfiguratorSlug } from "./pricing";

export type Faq = { question: string; answer: string };

export type Service = {
  slug: ConfiguratorSlug;
  /** Kurzform für Navigation und Kacheln. */
  name: string;
  /** H1 der Detailseite. */
  heading: string;
  /** Ein Satz aus dem Entwurf. */
  teaser: string;
  /** Erklärender Absatz auf der Detailseite. */
  body: string;
  /** Die Einzelleistungen aus dem Entwurf, unverändert. */
  items: string[];
  /** Lucide-Icon-Name, wird in der Kachel aufgelöst. */
  icon: "building" | "spray" | "sprout" | "truck";
  /**
   * KI-generiertes Bild. `assetId` verbindet Bild, Kennzeichnungs-Badge und
   * den Eintrag in story-spec.json — der Playwright-Test prüft darüber, dass
   * zu jedem pflichtigen Bild ein sichtbares Badge existiert.
   */
  image: { src: string; alt: string; assetId: string; width: number; height: number };
  seo: { title: string; description: string };
  faqs: Faq[];
};

export const services: Service[] = [
  {
    slug: "objektbetreuung",
    name: "Objektbetreuung",
    heading: "Objektbetreuung in Elmshorn und Umgebung",
    teaser:
      "Wir kümmern uns umfassend um Ihre Immobilie – von der Kontrolle über " +
      "die Wartung bis hin zur Werterhaltung.",
    body:
      "Eine Immobilie verliert nicht an einem Tag an Wert, sondern über Monate " +
      "unbemerkter Kleinigkeiten: die tropfende Leitung im Keller, die lose " +
      "Gehwegplatte, die niemand meldet. Als Ihr Objektbetreuer sind wir " +
      "regelmäßig vor Ort, dokumentieren den Zustand und melden Mängel, bevor " +
      "daraus Schäden werden. Für Eigentümer, Verwaltungen und WEGs übernehmen " +
      "wir die laufende Kontrolle, koordinieren Handwerker und halten fest, was " +
      "wann erledigt wurde – nachvollziehbar für jede Abrechnung.",
    items: [
      "Regelmäßige Objektkontrollen",
      "Überwachung & Dokumentation",
      "Schließ- & Öffnungsdienste",
      "Technische Kontrolle",
      "Kleinreparaturen & Instandhaltung",
      "Koordination von Handwerkern",
      "Mängelmanagement",
      "Werterhaltung der Immobilie",
    ],
    icon: "building",
    image: {
      src: "/images/objektbetreuung.webp",
      alt: "Behandschuhte Hände mit Checkliste vor einem Hauseingang mit Briefkastenanlage",
      assetId: "img-objektbetreuung",
      width: 880,
      height: 1168,
    },
    seo: {
      title: "Objektbetreuung Elmshorn — Hausmeisterservice für Ihre Immobilie",
      description:
        "Objektbetreuung und Hausmeisterservice in Elmshorn und im Kreis " +
        "Pinneberg: Kontrolle, Dokumentation, Kleinreparaturen. Monatspreis " +
        "online berechnen.",
    },
    faqs: [
      {
        question: "Was kostet Objektbetreuung pro Wohneinheit im Monat?",
        answer:
          "Üblich sind 15 bis 40 Euro pro Wohneinheit und Monat, abhängig davon, " +
          "welche Module Sie buchen. Unser Konfigurator zeigt Ihnen den Rahmen " +
          "für Ihr Objekt sofort — die Grundbetreuung mit Objektkontrolle und " +
          "Mängelmeldung ist immer enthalten.",
      },
      {
        question: "Übernehmen Sie auch den Winterdienst?",
        answer:
          "Ja, Räum- und Streupflicht können Sie als Modul dazubuchen. Wir " +
          "rechnen das saisonal ab, damit im Sommer kein Anteil dafür anfällt.",
      },
      {
        question: "Wie werden Mängel dokumentiert?",
        answer:
          "Wir halten jeden Kontrollgang mit Fotos fest. Sie bekommen die " +
          "Dokumentation zu Ihrem Objekt, sodass Sie gegenüber Eigentümern oder " +
          "Mietern jederzeit belegen können, was wann festgestellt und erledigt wurde.",
      },
      {
        question: "Ist der Betreuungsvertrag an eine Laufzeit gebunden?",
        answer:
          "Nein. Unsere Betreuungsverträge sind monatlich kündbar — wir wollen " +
          "durch Arbeit überzeugen, nicht durch Vertragsbindung.",
      },
    ],
  },

  {
    slug: "gebaeudereinigung",
    name: "Gebäudereinigung",
    heading: "Gebäudereinigung in Elmshorn und Umgebung",
    teaser:
      "Sauberkeit, auf die Sie sich verlassen können. Wir reinigen gründlich, " +
      "zuverlässig und sorgen für ein angenehmes Umfeld.",
    body:
      "Sauberkeit fällt erst auf, wenn sie fehlt. Genau deshalb arbeiten wir mit " +
      "festen Turnussen und festen Ansprechpartnern: Sie wissen, wer kommt und " +
      "wann. Wir übernehmen die laufende Unterhaltsreinigung in Treppenhäusern, " +
      "Büros und Praxen, reinigen Glas und Fenster, führen Grundreinigungen durch " +
      "und übergeben Objekte nach Umzug oder Bauarbeiten bezugsfertig. Bei " +
      "Praxen und Gemeinschaftsflächen reinigen wir auf Wunsch desinfizierend.",
    items: [
      "Unterhaltsreinigung",
      "Glas- & Fensterreinigung",
      "Treppenhausreinigung",
      "Büro- & Praxisreinigung",
      "Grundreinigung",
      "Desinfektionsreinigung",
      "Bodenpflege & -beschichtung",
      "Sonderreinigungen",
      "Reinigung nach Umzug",
      "Terrassenreinigung",
    ],
    icon: "spray",
    image: {
      src: "/images/gebaeudereinigung.webp",
      alt: "Treppenhaus wird mit einem Flachmopp gereinigt, daneben ein Warnschild",
      assetId: "img-gebaeudereinigung",
      width: 880,
      height: 1168,
    },
    seo: {
      title: "Gebäudereinigung Elmshorn — Preis in 60 Sekunden berechnen",
      description:
        "Unterhaltsreinigung, Treppenhaus, Büro und Praxis in Elmshorn und im " +
        "Kreis Pinneberg. Richtpreis online berechnen, Festpreis nach " +
        "kostenloser Besichtigung.",
    },
    faqs: [
      {
        question: "Was kostet eine Gebäudereinigung pro Quadratmeter?",
        answer:
          "Für die laufende Unterhaltsreinigung liegen marktübliche Preise " +
          "zwischen 0,80 und 1,50 Euro pro Quadratmeter, Treppenhausreinigung " +
          "zwischen 2,50 und 5,00 Euro. Wir kalkulieren am unteren Rand dieser " +
          "Spanne — den Rahmen für Ihre Fläche sehen Sie im Konfigurator sofort.",
      },
      {
        question: "Wie oft sollte ein Treppenhaus gereinigt werden?",
        answer:
          "In Mehrfamilienhäusern hat sich ein wöchentlicher Turnus bewährt, bei " +
          "wenig frequentierten Objekten reichen 14 Tage. Bei Objekten mit " +
          "Gewerbe im Haus oder viel Publikumsverkehr empfehlen wir zweimal " +
          "pro Woche.",
      },
      {
        question: "Kann ich die Reinigung steuerlich absetzen?",
        answer:
          "Als Privathaushalt können Sie 20 Prozent der Arbeitskosten für " +
          "haushaltsnahe Dienstleistungen von der Steuer absetzen (§ 35a EStG), " +
          "maximal 4.000 Euro im Jahr. Voraussetzung ist eine Rechnung und die " +
          "Zahlung per Überweisung — Barzahlung erkennt das Finanzamt nicht an.",
      },
      {
        question: "Bringen Sie Reinigungsmittel und Geräte mit?",
        answer:
          "Ja, Material und Maschinen sind im Preis enthalten. Wenn Sie " +
          "bestimmte Mittel wünschen, etwa aus Rücksicht auf Allergien oder " +
          "empfindliche Böden, richten wir uns danach.",
      },
    ],
  },

  {
    slug: "gartenpflege",
    name: "Gartenpflege",
    heading: "Gartenpflege in Elmshorn und Umgebung",
    teaser:
      "Wir pflegen Ihre Grünanlagen mit Fachkenntnis und Sorgfalt – für ein " +
      "gepflegtes und harmonisches Außenbild.",
    body:
      "Ein Garten ist Arbeit, die immer dann anfällt, wenn man am wenigsten Zeit " +
      "hat. Wir übernehmen sie im festen Turnus: Rasen mähen, Hecken und " +
      "Sträucher schneiden, Unkraut entfernen, Beete pflegen, im Herbst das Laub. " +
      "Für Wohnanlagen und Gewerbeobjekte betreuen wir Grünflächen ganzjährig, " +
      "inklusive Düngung, Bewässerung und Neupflanzungen. Den Grünschnitt nehmen " +
      "wir mit — Sie müssen sich um die Entsorgung nicht kümmern.",
    items: [
      "Rasenmähen",
      "Heckenschnitt",
      "Strauch- & Baumpflege",
      "Unkrautentfernung",
      "Laubentsorgung",
      "Bewässerung",
      "Düngung",
      "Beetpflege",
      "Neupflanzungen",
      "Garten- & Grünanlagenpflege (ganzjährig)",
    ],
    icon: "sprout",
    image: {
      src: "/images/gartenpflege.webp",
      alt: "Heckenschnitt mit einer elektrischen Heckenschere an einer dichten grünen Hecke",
      assetId: "img-gartenpflege",
      width: 880,
      height: 1168,
    },
    seo: {
      title: "Gartenpflege Elmshorn — Rasen, Hecke, Grünanlagen",
      description:
        "Rasenmähen, Heckenschnitt und ganzjährige Grünanlagenpflege in " +
        "Elmshorn und im Kreis Pinneberg. Monatsrahmen online berechnen.",
    },
    faqs: [
      {
        question: "Was kostet Rasenmähen pro Quadratmeter?",
        answer:
          "Marktüblich sind 0,10 bis 0,15 Euro pro Quadratmeter, alternativ 30 " +
          "bis 40 Euro pro Stunde. Für einen 400 Quadratmeter großen Garten mit " +
          "regelmäßiger Pflege liegen Sie meist im Bereich von 150 bis 300 Euro " +
          "im Monat, abhängig davon, was zum Mähen dazukommt.",
      },
      {
        question: "Wann ist der richtige Zeitpunkt für den Heckenschnitt?",
        answer:
          "Der kräftige Rückschnitt gehört in den Zeitraum vom 1. Oktober bis " +
          "28. Februar — dazwischen schützt das Bundesnaturschutzgesetz brütende " +
          "Vögel, dann sind nur schonende Form- und Pflegeschnitte erlaubt. " +
          "Wir planen den Termin entsprechend ein.",
      },
      {
        question: "Übernehmen Sie auch die Entsorgung des Grünschnitts?",
        answer:
          "Ja. Sie wählen im Konfigurator, ob eine kleine Menge per Anhänger " +
          "oder eine größere Menge per Container abgeholt wird. Wenn Sie einen " +
          "eigenen Kompost haben, lassen wir den Schnitt auf Wunsch vor Ort.",
      },
      {
        question: "Gibt es Verträge nur für die Saison?",
        answer:
          "Ja. Beim Saisonvertrag arbeiten wir von März bis Oktober und " +
          "verteilen die Kosten auf zwölf Monate — so bleibt Ihre monatliche " +
          "Belastung gleich, statt im Sommer zu springen.",
      },
    ],
  },

  {
    slug: "entruempelung",
    name: "Entrümpelung",
    heading: "Entrümpelung in Elmshorn und Umgebung",
    teaser:
      "Wir schaffen Platz – schnell, diskret und zuverlässig. Ob Keller, " +
      "Wohnung oder Büro: Wir entrümpeln für Sie.",
    body:
      "Entrümpelungen haben fast immer einen Anlass, der schwerer wiegt als der " +
      "Umzugstermin: ein Todesfall, ein Pflegefall, eine Trennung. Wir arbeiten " +
      "deshalb diskret und ohne Aufsehen im Haus. Wir räumen Wohnungen, Keller, " +
      "Dachböden, Büros und Gewerbeflächen, trennen und entsorgen umweltgerecht " +
      "und übergeben besenrein — auf Wunsch mit anschließender Grundreinigung, " +
      "sodass die Wohnung direkt an den Vermieter zurückgehen kann. " +
      "Verwertbares Mobiliar rechnen wir an und senken damit Ihren Preis.",
    items: [
      "Wohnungsauflösungen",
      "Haushaltsauflösungen",
      "Kellerentrümpelungen",
      "Dachbodenentrümpelungen",
      "Büro- & Gewerbeentrümpelungen",
      "Entsorgung & umweltgerechte Trennung",
      "Transporte",
      "Messie-Wohnungen",
      "Räumung nach Todesfällen",
      "Besichtigung & Angebot kostenlos",
    ],
    icon: "truck",
    image: {
      src: "/images/entruempelung.webp",
      alt: "Leergeräumtes Zimmer mit gestapelten Umzugskartons und Tageslicht am Fenster",
      assetId: "img-entruempelung",
      width: 880,
      height: 1168,
    },
    seo: {
      title: "Entrümpelung Elmshorn — Richtpreis pro m² sofort berechnen",
      description:
        "Wohnungsauflösung, Keller- und Dachbodenentrümpelung in Elmshorn und " +
        "im Kreis Pinneberg. Richtpreis online berechnen, Besichtigung kostenlos.",
    },
    faqs: [
      {
        question: "Was kostet eine Entrümpelung pro Quadratmeter?",
        answer:
          "Marktüblich sind 15 bis 55 Euro pro Quadratmeter, gestaffelt nach " +
          "Füllgrad: wenig Inventar liegt bei 15 bis 20 Euro, ein normal " +
          "möblierter Haushalt bei 20 bis 28 Euro, volle Räume bei 28 bis 38 " +
          "Euro. Wir setzen den unteren Rand an — was Ihr Objekt kostet, zeigt " +
          "der Konfigurator in unter einer Minute.",
      },
      {
        question: "Warum kostet ein höheres Stockwerk mehr?",
        answer:
          "Weil jedes Möbelstück die Treppe hinunter muss, nicht nur einmal der " +
          "Weg. Ohne Aufzug steigt der Aufwand mit jeder Etage deutlich — bei " +
          "gleicher Wohnungsgröße kann sich der Quadratmeterpreis dadurch mehr " +
          "als verdoppeln.",
      },
      {
        question: "Wird verwertbares Mobiliar angerechnet?",
        answer:
          "Ja. Was sich weiterverkaufen oder weitergeben lässt, rechnen wir " +
          "gegen. Das steht nach der kostenlosen Besichtigung fest und senkt den " +
          "Preis gegenüber dem Richtwert.",
      },
      {
        question: "Übernehmen Sie auch Messie-Wohnungen und Räumungen nach Todesfällen?",
        answer:
          "Ja, beides. Wir gehen mit solchen Aufträgen respektvoll und " +
          "zurückhaltend um: unbeschriftetes Fahrzeug auf Wunsch, keine " +
          "Gespräche mit Nachbarn, Fundstücke wie Dokumente oder Fotos werden " +
          "gesichert und Ihnen übergeben.",
      },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export const serviceSlugs = services.map((s) => s.slug);
