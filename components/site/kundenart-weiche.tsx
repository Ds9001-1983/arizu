import { ArrowRight, Building2, Check, House } from "lucide-react";
import { waehleKundenart } from "@/app/kundenart-actions";
import type { LeadKundenart } from "@/lib/db";
import { Container } from "./container";

/* ==================================================================
   Weiche Privat- oder Geschäftskunde. Seit 04.11.2026 unter der
   Leistungsübersicht der Startseite statt direkt unter dem Hero: Wer landet,
   soll zuerst sehen, was ARIZU macht, und dann seinen Bereich wählen.

   Aus dem Kundengespräch vom 14.08.2026, Arians Wortlaut: "dort könnten wir
   dann zum Beispiel eine kleine Abfrage machen, privat oder Geschäftskunde.
   Dann könnten wir bei Privatkunde die Seite und Seitenstruktur so lassen,
   wie sie ist."

   ZWEI DINGE, DIE HIER ABSICHT SIND:

   1. Keine Tab-Rollen. Tabs schalten Bereiche derselben Seite um; diese
      Weiche sendet den Nutzer auf einen eigenständigen Seitenweg.

   2. Kein Cookie, localStorage oder Drittanbieter-Tracking. Der bewusste
      Klick wird als eine von zwei anonymen Summen serverseitig gezählt. Das
      Formular ruft die Server Action erst beim Absenden auf — Link-Prefetch
      und Suchmaschinenbesuche können die Statistik daher nicht aufblasen.
   ================================================================== */

/* Die Punkte stammen aus vorhandenen, abgestimmten Aussagen: Preisrechner und
   § 35a (Privatkunden, FAQ Gebäudereinigung), Sammelrechnung, Rahmenvertrag
   und Arbeiten außerhalb der Öffnungszeiten (FAQ Geschäftskunden). */
const wege = [
  {
    id: "privat" as const,
    icon: House,
    titel: "Für Privatkunden",
    text: "Wohnung, Haus oder Garten: Sie sehen den Preisrahmen, bevor Sie anfragen.",
    punkte: [
      "Preis online schätzen, ohne Kontaktdaten",
      "20 % der Arbeitskosten steuerlich absetzbar (§ 35a EStG)",
      "Besichtigung kostenlos und unverbindlich",
    ],
    cta: "Zum Privatkundenbereich",
  },
  {
    id: "geschaeft" as const,
    icon: Building2,
    titel: "Für Unternehmen und Hausverwaltungen",
    text: "Büro, Praxis, Wohnanlage oder Ladenlokal: Angebot nach kostenloser Begehung.",
    punkte: [
      "Ein fester Ansprechpartner für alle Leistungen",
      "Eine Rechnung im Monat, jedes Objekt einzeln ausgewiesen",
      "Auch außerhalb Ihrer Öffnungszeiten",
      "Rahmenvertrag, monatlich kündbar",
    ],
    cta: "Zum Geschäftskundenbereich",
  },
];

function actionFuer(kundenart: LeadKundenart) {
  return waehleKundenart.bind(null, kundenart);
}

export function KundenartWeiche() {
  return (
    <section
      aria-labelledby="kundenart-titel"
      // Dunkles Band zwischen Leistungen und Objektarten: Hier fällt die
      // Entscheidung, wohin es weitergeht.
      className="bg-navy-band py-16 sm:py-20"
    >
      <Container>
        <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-soft">
          Für wen arbeiten wir?
        </p>
        <h2
          id="kundenart-titel"
          className="mt-3 font-display text-3xl text-white sm:text-4xl"
        >
          Privat oder Unternehmen: Wählen Sie Ihren Bereich
        </h2>
        <ul className="mt-10 grid gap-5 lg:grid-cols-2">
          {wege.map((w) => (
            <li
              key={w.id}
              className="flex flex-col rounded-sm border border-white/15 bg-white/5 p-7"
            >
              <w.icon className="size-7 text-gold" strokeWidth={1.5} aria-hidden />
              <h3 className="mt-4 font-display text-xl text-white">{w.titel}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{w.text}</p>
              <ul className="mt-5 space-y-2.5">
                {w.punkte.map((punkt) => (
                  <li key={punkt} className="flex gap-3 text-[0.95rem] text-white/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                    <span>{punkt}</span>
                  </li>
                ))}
              </ul>
              {/* Nur der Button sendet das Formular: Sein Name bleibt kurz, und
                  der Zähler zählt nur bewusste Klicks. */}
              <form action={actionFuer(w.id)} className="mt-auto pt-7">
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3.5 font-display text-sm font-bold text-navy transition-colors hover:bg-gold-soft"
                >
                  {w.cta}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </button>
              </form>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
