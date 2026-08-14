import Link from "next/link";
import { ArrowRight, Building2, House } from "lucide-react";
import { Container } from "./container";

/* ==================================================================
   Weiche direkt unter dem Hero: Privat- oder Geschäftskunde?

   Aus dem Kundengespräch vom 14.08.2026, Arians Wortlaut: "dort könnten wir
   dann zum Beispiel eine kleine Abfrage machen, privat oder Geschäftskunde.
   Dann könnten wir bei Privatkunde die Seite und Seitenstruktur so lassen,
   wie sie ist."

   ZWEI DINGE, DIE HIER ABSICHT SIND:

   1. Keine Tab-Rollen. Naheliegend wäre role="tablist"/role="tab" wie in
      konfigurator-tabs.tsx — hier aber falsch: Tabs schalten Bereiche
      derselben Seite um, diese Weiche führt auf eine andere Route. Und
      praktisch: qa-tests/konfigurator.spec.ts greift auf der Startseite
      ungescopet mit getByRole("tabpanel") zu. Ein zweites Tablist auf "/"
      ließe Playwrights Strict Mode sofort scheitern.

   2. Keine Server Component mit Cookie, kein localStorage, kein Merken der
      Wahl. Die Startseite ist vollstatisch; sie an ein Cookie zu hängen
      hieße, die meistbesuchte Seite dynamisch auszuliefern — für einen
      Komfortgewinn, den ein Betrieb mit überwiegend Erstbesuchern nie
      einspielt. Der Ersatz kostet nichts: Der Geschäftskundenbereich hat
      einen festen Platz in Kopf- und Fußzeile.
   ================================================================== */

const wege = [
  {
    href: "#richtpreis",
    icon: House,
    titel: "Ich bin Privatkunde",
    text: "Wohnung, Haus oder Garten. Richtpreis sofort, ohne Daten zu hinterlassen.",
    cta: "Zum Richtpreisrechner",
  },
  {
    href: "/geschaeftskunden",
    icon: Building2,
    titel: "Ich frage für ein Unternehmen an",
    text: "Büro, Praxis, Wohnanlage oder Ladenlokal. Angebot nach kostenloser Begehung.",
    cta: "Zum Geschäftskundenbereich",
  },
];

export function KundenartWeiche() {
  return (
    <section
      aria-labelledby="kundenart-titel"
      // Dieselbe Farbe wie die TrustBar direkt darunter: Beide wachsen so zu
      // einem dunklen Sockel unter dem Hero zusammen, statt einen hellen
      // Streifen zwischen zwei dunkle Bänder zu setzen.
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
            <li key={w.href}>
              <Link
                href={w.href}
                className="group flex h-full items-start gap-4 rounded-sm border border-white/15 bg-white/5 p-5 transition-colors hover:border-gold"
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
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
