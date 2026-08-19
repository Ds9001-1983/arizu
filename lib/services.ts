/* ==================================================================
   Leistungskatalog — Inhalte 1:1 aus Arians Designentwurf vom 12.08.2026.
   Die Einzelleistungen stammen aus dem Entwurf und werden mit den
   nachgereichten Kundenwünschen fortgeführt, damit Website und Angebot
   dasselbe versprechen.

   Die Fließtexte (`teaser`, `body`) sind für Menschen UND für KI-Systeme
   geschrieben: jede Einzelleistung wird benannt und erklärt, statt nur als
   Stichwort gelistet. ChatGPT, Perplexity und Gemini lesen Inhalt, keine
   Keyword-Dichte — das ist der GEO-Teil des Auftrags.
   ================================================================== */

import type { ConfiguratorSlug } from "./pricing";

export type Faq = { question: string; answer: string };

export type Service = {
  slug: ConfiguratorSlug;
  /** Ob diese Leistung im Privatkundenbereich eine öffentliche Preisschätzung hat. */
  hasPublicCalculator: boolean;
  /** Kurzform für Navigation und Kacheln. */
  name: string;
  /** H1 der Detailseite. */
  heading: string;
  /** Ein Satz aus dem Entwurf. */
  teaser: string;
  /** Erklärender Absatz auf der Detailseite. */
  body: string;
  /** Zielgruppengerechter Kurztext für die Geschäftskundenübersicht. */
  businessTeaser: string;
  /** Die Einzelleistungen aus dem Entwurf, unverändert. */
  items: string[];
  /** Lucide-Icon-Name, wird in der Kachel aufgelöst. */
  icon: "building" | "spray" | "sprout" | "truck";
  /**
   * Emoji für die WhatsApp-Nachricht. In einer Chat-App ist ein Icon-Font
   * keine Option — Emojis sind dort die einzige Bildsprache, die überall
   * gleich ankommt.
   */
  emoji: string;
  /**
   * KI-generiertes Bild. `assetId` verbindet Bild, Kennzeichnungs-Badge und
   * den Eintrag in story-spec.json — der Playwright-Test prüft darüber, dass
   * zu jedem pflichtigen Bild ein sichtbares Badge existiert.
   */
  image: { src: string; alt: string; assetId: string; width: number; height: number };
  seo: { title: string; description: string };
  faqs: Faq[];
};

const serviceCatalog: Service[] = [
  {
    slug: "objektbetreuung",
    hasPublicCalculator: false,
    name: "Objektbetreuung",
    heading: "Objektbetreuung",
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
    businessTeaser:
      "Wir übernehmen die laufende Kontrolle, Koordination und Werterhaltung " +
      "von Wohnanlagen, Gewerbeimmobilien und weiteren Objekten.",
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
    emoji: "🏢",
    image: {
      src: "/images/objektbetreuung.webp",
      alt: "Behandschuhte Hände mit Checkliste vor einem Hauseingang mit Briefkastenanlage",
      assetId: "img-objektbetreuung",
      width: 880,
      height: 1168,
    },
    seo: {
      title: "Objektbetreuung im Kreis Pinneberg und in Hamburg",
      description:
        "Objektbetreuung und Hausmeisterservice im Kreis Pinneberg und in Hamburg: " +
        "Kontrolle, Dokumentation und Kleinreparaturen. Persönliches Angebot " +
        "nach kostenloser Besichtigung, auch im Umkreis von 50 km um Elmshorn.",
    },
    faqs: [
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
    hasPublicCalculator: true,
    name: "Gebäudereinigung",
    heading: "Gebäudereinigung",
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
    businessTeaser:
      "Zuverlässige Unterhalts-, Büro- und Praxisreinigung – abgestimmt auf " +
      "Nutzung, Betriebszeiten und die Anforderungen Ihres Objekts.",
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
      "Bau- und Bauendreinigung",
      "Terrassenreinigung",
    ],
    icon: "spray",
    emoji: "🧽",
    image: {
      src: "/images/gebaeudereinigung.webp",
      alt: "Treppenhaus wird mit einem Flachmopp gereinigt, daneben ein Warnschild",
      assetId: "img-gebaeudereinigung",
      width: 880,
      height: 1168,
    },
    seo: {
      title: "Gebäudereinigung im Kreis Pinneberg und in Hamburg",
      description:
        "Gebäudereinigung, Treppenhaus- sowie Bauendreinigung im Kreis Pinneberg " +
        "und in Hamburg sowie im Umkreis von 50 km um Elmshorn. Preisrahmen online, " +
        "Festpreis nach kostenloser Besichtigung.",
    },
    faqs: [
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
    hasPublicCalculator: true,
    name: "Grün- und Außenanlagenpflege",
    heading: "Grün- und Außenanlagenpflege",
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
    businessTeaser:
      "Wir pflegen Grün- und Außenanlagen regelmäßig und fachgerecht – für ein " +
      "gepflegtes Erscheinungsbild Ihrer Immobilie.",
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
      "Grün- und Außenanlagenpflege (ganzjährig)",
    ],
    icon: "sprout",
    emoji: "🌿",
    image: {
      src: "/images/gartenpflege.webp",
      alt: "Heckenschnitt mit einer elektrischen Heckenschere an einer dichten grünen Hecke",
      assetId: "img-gartenpflege",
      width: 880,
      height: 1168,
    },
    seo: {
      title: "Grün- und Außenanlagenpflege im Kreis Pinneberg und in Hamburg",
      description:
        "Rasenmähen, Heckenschnitt und ganzjährige Grünanlagenpflege im " +
        "Kreis Pinneberg, in Hamburg und im Umkreis von 50 km um Elmshorn. " +
        "Voraussichtlichen Preisrahmen online berechnen.",
    },
    faqs: [
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
    hasPublicCalculator: true,
    name: "Entrümpelung und Auflösung",
    heading: "Entrümpelung und Auflösung",
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
    businessTeaser:
      "Wir übernehmen Büro- und Gewerbeentrümpelungen – diskret, planbar und " +
      "mit fachgerechter Entsorgung.",
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
    emoji: "📦",
    image: {
      src: "/images/entruempelung.webp",
      alt: "Leergeräumtes Zimmer mit gestapelten Umzugskartons und Tageslicht am Fenster",
      assetId: "img-entruempelung",
      width: 880,
      height: 1168,
    },
    seo: {
      title: "Entrümpelung und Auflösung im Kreis Pinneberg und in Hamburg",
      description:
        "Wohnungsauflösung, Keller- und Dachbodenentrümpelung im Kreis Pinneberg " +
        "und in Hamburg sowie im Umkreis von 50 km um Elmshorn. Preisrahmen online, " +
        "Besichtigung kostenlos.",
    },
    faqs: [
      {
        question: "Wird verwertbares Mobiliar angerechnet?",
        answer:
          "Ja. Was sich weiterverkaufen oder weitergeben lässt, rechnen wir " +
          "gegen. Das steht nach der kostenlosen Besichtigung fest und senkt den " +
          "endgültigen Angebotspreis.",
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

/* Die sichtbare Reihenfolge ist eine redaktionelle Entscheidung und nicht an
   die historische Reihenfolge der Preis-Specs gekoppelt. Die stabilen Slugs
   bleiben unverändert, damit Links, Leads und interne Statistiken nicht
   brechen. */
const SERVICE_ORDER: ConfiguratorSlug[] = [
  "gebaeudereinigung",
  "gartenpflege",
  "entruempelung",
  "objektbetreuung",
];

export const services: Service[] = SERVICE_ORDER.map(
  (slug) => serviceCatalog.find((service) => service.slug === slug)!,
);

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export const serviceSlugs = services.map((s) => s.slug);
