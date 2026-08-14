import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/site/container";
import { dbConfigured, listRateOverrides, type PreisZeile } from "@/lib/db";
import {
  configurators,
  defaultValues,
  estimateRange,
  euro,
  gross,
  resolveRates,
  summarize,
  type ConfiguratorSpec,
} from "@/lib/pricing";
import { resetPreise, savePreise } from "../actions";

/* ==================================================================
   Preispflege.

   Im Kundengespräch vom 14.08.2026 zugesagt: Arian soll die Sätze selbst
   ändern können, ohne anzurufen. Bewusst OHNE Warn- oder Grenzwertlogik —
   so vom Auftraggeber entschieden. Die einzigen Prüfungen in der Server
   Action sind technischer Natur (keine Buchstaben, nichts Negatives), damit
   die Seite nicht kaputtrechnet.

   Bedienkonzept: Ein leeres Feld heißt "Standard gilt". Damit ist der
   Grundzustand der Seite komplett leer, alle Standardwerte stehen als
   Platzhalter daneben, und Zurücksetzen ist schlicht Feld leeren. Das
   Datenmodell — nur Überschreibungen werden gespeichert — wird dadurch
   bedienbar sichtbar, ohne dass man es erklären muss.
   ================================================================== */

export const metadata: Metadata = {
  title: "Preise",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const zahl = (n: number) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Beispielrechnung mit den WIRKSAMEN Sätzen. */
function beispiel(spec: ConfiguratorSpec, rates: Record<string, number>) {
  const v = defaultValues(spec);
  const r = spec.calc(v, rates);
  const spanne = estimateRange(gross(r.net));
  return {
    angaben: summarize(spec, v),
    preis: `ca. ${euro(spanne.low)} – ${euro(spanne.high)} ${r.unit}`,
  };
}

export default async function PreisePage({
  searchParams,
}: {
  searchParams: Promise<{ gespeichert?: string }>;
}) {
  const { gespeichert } = await searchParams;

  let overrides: PreisZeile[] = [];
  let fehler: string | null = null;
  if (!dbConfigured) {
    fehler =
      "Es ist keine DATABASE_URL gesetzt. Es gelten die im Code hinterlegten " +
      "Standardpreise, Änderungen sind erst nach Anbindung der Datenbank möglich.";
  } else {
    try {
      overrides = await listRateOverrides();
    } catch (err) {
      fehler = "Die Datenbank ist nicht erreichbar. Es gelten die Standardpreise.";
      console.error("[ARIZU preise]", err);
    }
  }

  const field =
    "w-28 rounded-sm border border-mist bg-surface px-3 py-2 text-right text-[0.95rem] text-navy focus:border-gold focus:outline-none";

  return (
    <div className="py-10">
      <Container>
        <Link
          href="/intern"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-navy"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Zurück zu den Anfragen
        </Link>

        <h1 className="mt-6 font-display text-2xl text-navy">Preise</h1>
        <div className="mt-3 max-w-2xl space-y-2 text-sm leading-relaxed text-ink-muted">
          <p>
            <strong className="text-navy">Leer heißt: der Standard daneben gilt.</strong>{" "}
            Tragen Sie nur dort etwas ein, wo Sie abweichen wollen. Ein Feld
            wieder zu leeren setzt den Standard zurück.
          </p>
          <p>
            <strong className="text-navy">Alle Beträge sind Nettopreise</strong>, also
            ohne Mehrwertsteuer. Auf der Website kommen 19 % dazu.
          </p>
          <p>
            Änderungen erscheinen auf der Website mit dem nächsten Seitenaufruf.
            Beim allerersten Nachladen kann noch der alte Wert stehen.
          </p>
        </div>

        {fehler && (
          <p className="mt-8 rounded-sm border border-gold/40 bg-gold/8 px-4 py-3 text-sm text-navy">
            {fehler}
          </p>
        )}

        {Object.entries(configurators).map(([slug, spec]) => {
          const eigene = overrides.filter((o) => o.konfigurator === slug);
          const wirksam = resolveRates(spec, eigene);
          const bsp = beispiel(spec, wirksam);
          const gruppen = [...new Set(spec.rateFields.map((f) => f.group))];

          return (
            <section key={slug} id={slug} className="mt-10 scroll-mt-6">
              <form action={savePreise}>
                <input type="hidden" name="konfigurator" value={slug} />

                <div className="rounded-sm border border-mist bg-surface">
                  <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-mist px-5 py-4">
                    <h2 className="font-display text-lg text-navy">{spec.title}</h2>
                    {gespeichert === slug && (
                      <span className="rounded-xs bg-gold px-2 py-0.5 font-display text-[0.66rem] font-bold uppercase tracking-[0.12em] text-navy">
                        gespeichert
                      </span>
                    )}
                  </div>

                  <div className="space-y-6 px-5 py-5">
                    {gruppen.map((gruppe) => (
                      <div key={gruppe}>
                        <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                          {gruppe}
                        </p>
                        <ul className="mt-3 space-y-3">
                          {spec.rateFields
                            .filter((f) => f.group === gruppe)
                            .map((f) => {
                              const zeile = eigene.find((o) => o.schluessel === f.key);
                              const standard = spec.defaultRates[f.key];
                              return (
                                <li
                                  key={f.key}
                                  className="grid gap-x-4 gap-y-1 sm:grid-cols-[1fr_auto_14rem] sm:items-center"
                                >
                                  <label
                                    htmlFor={`${slug}-${f.key}`}
                                    className="text-sm text-navy"
                                  >
                                    {f.label}
                                    {f.hint && (
                                      <span className="mt-0.5 block text-xs text-ink-muted">
                                        {f.hint}
                                      </span>
                                    )}
                                  </label>

                                  <div className="flex items-center gap-2">
                                    <input
                                      id={`${slug}-${f.key}`}
                                      name={`satz.${f.key}`}
                                      type="text"
                                      inputMode="decimal"
                                      defaultValue={zeile ? zahl(zeile.wert) : ""}
                                      placeholder={zahl(standard)}
                                      className={field}
                                    />
                                    <span className="text-xs text-ink-muted">{f.unit}</span>
                                  </div>

                                  {/* Der Standard steht IMMER da, auch wenn das
                                      Feld gefüllt ist — sonst weiß Arian bei
                                      einer bestehenden Abweichung nicht mehr,
                                      wovon er abweicht. */}
                                  <span className="text-xs text-ink-muted">
                                    Standard {zahl(standard)}
                                    {zeile && " · geändert"}
                                  </span>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-mist bg-shell px-5 py-4">
                    <p className="text-xs text-ink-muted">Beispiel mit den Startwerten</p>
                    <p className="mt-1 text-sm text-navy">
                      {bsp.angaben} → <strong>{bsp.preis}</strong>, inkl. MwSt.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 border-t border-mist px-5 py-4">
                    <button
                      type="submit"
                      className="rounded-sm bg-gold px-6 py-3 font-display text-sm font-bold text-navy transition-colors hover:bg-gold-soft"
                    >
                      Speichern
                    </button>
                    {eigene.length > 0 && (
                      // formAction im selben Formular — erlaubtes HTML, kein
                      // verschachteltes Formular, kein JavaScript.
                      <button
                        type="submit"
                        formAction={resetPreise}
                        className="text-sm font-semibold text-ink-muted hover:text-navy"
                      >
                        Alle {eigene.length} Abweichungen zurücksetzen
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </section>
          );
        })}
      </Container>
    </div>
  );
}
