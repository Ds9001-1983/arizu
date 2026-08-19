import { ArrowRight, Building2, House } from "lucide-react";
import { waehleKundenart } from "@/app/kundenart-actions";
import type { LeadKundenart } from "@/lib/db";
import { Container } from "./container";

/* ==================================================================
   Weiche direkt unter dem Hero: Privat- oder Geschäftskunde?

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

const wege = [
  {
    id: "privat" as const,
    icon: House,
    titel: "Ich bin Privatkunde",
    text: "Wohnung, Haus oder Außenanlage. Preisschätzung sofort, ohne Daten zu hinterlassen.",
    cta: "Zum Privatkundenbereich",
  },
  {
    id: "geschaeft" as const,
    icon: Building2,
    titel: "Ich frage für ein Unternehmen an",
    text: "Büro, Praxis, Wohnanlage oder Ladenlokal. Angebot nach kostenloser Begehung.",
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
      // Dunkler Sockel unter dem Hero: Die Zielgruppenentscheidung bleibt so
      // optisch mit dem Einstieg verbunden.
      className="border-b border-white/10 bg-navy-band py-8"
    >
      <Container>
        <p
          id="kundenart-titel"
          className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-soft"
        >
          Für wen arbeiten wir?
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {wege.map((w) => (
            <li key={w.id}>
              <form action={actionFuer(w.id)} className="h-full">
                <button
                  type="submit"
                  className="group flex h-full w-full items-start gap-4 rounded-sm border border-white/15 bg-white/5 p-5 text-left transition-colors hover:border-gold"
                >
                  <w.icon className="mt-0.5 size-6 shrink-0 text-gold" aria-hidden />
                  <span className="block">
                    <span className="block font-display text-[1.05rem] font-bold text-white">
                      {w.titel}
                    </span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-white/70">
                      {w.text}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                      {w.cta}
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
