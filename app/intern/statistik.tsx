import { services } from "@/lib/services";
import type { AuswahlZaehler, BereichZeile } from "@/lib/db";

/* ==================================================================
   Welcher Leistungsbereich wird am häufigsten angefragt?

   Arians Frage aus dem Gespräch vom 14.08.2026, aufgeschlüsselt nach
   Geschäfts- und Privatkunden — er wollte sehen, "welche Bereiche am meisten
   benutzt werden".

   Balken als reines CSS statt Diagrammbibliothek: Das Projekt hat ein
   Budget von 150 KB Initial-JS (AGENTS.md), und eine Bibliothek für vier
   waagerechte Balken wäre auch ohne Budget übertrieben. Die Zahl steht als
   Text da, der Balken ist `aria-hidden` — damit ist die Information für
   Screenreader vollständig, ohne dass sie doppelt vorgelesen wird.
   ================================================================== */

type Gruppe = { titel: string; zeilen: { label: string; anzahl: number }[] };

/** Zeilen einer Kundenart auf die vier Bereiche plus "ohne Zuordnung" bringen. */
function gruppiere(rows: BereichZeile[], kundenart: string | null): Gruppe["zeilen"] {
  const passend = rows.filter((r) => r.kundenart === kundenart);
  const zeilen = services.map((s) => ({
    label: s.name,
    anzahl: passend.find((r) => r.service === s.slug)?.anzahl ?? 0,
  }));

  // Anfragen über das allgemeine Formular tragen keine Leistung, und
  // "Mehreres oder noch offen" im Geschäftskundenformular ebenfalls nicht.
  // Die Zeile fehlt zu lassen wäre bequem, aber dann ergäben die Teile nicht
  // mehr die Gesamtzahl — und eine Statistik, deren Summen nicht aufgehen,
  // wird zu Recht nicht geglaubt.
  const ohne = passend.find((r) => r.service === null)?.anzahl ?? 0;
  if (ohne > 0) zeilen.push({ label: "ohne Zuordnung", anzahl: ohne });

  return zeilen.sort((a, b) => b.anzahl - a.anzahl);
}

function Balken({ zeilen }: { zeilen: Gruppe["zeilen"] }) {
  const max = Math.max(1, ...zeilen.map((z) => z.anzahl));
  const summe = zeilen.reduce((n, z) => n + z.anzahl, 0);

  if (summe === 0) {
    return <p className="text-sm text-ink-muted">Noch keine Anfragen.</p>;
  }

  return (
    <ul className="space-y-2.5">
      {zeilen.map((z) => (
        <li key={z.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-navy">{z.label}</span>
            <span className="tabular-nums text-ink-muted">{z.anzahl}</span>
          </div>
          <div className="mt-1 h-2 rounded-xs bg-mist">
            {/* Inline-style ist hier richtig: Tailwind erzeugt Klassen zur
                Bauzeit und kann eine gerechnete Breite nicht kennen. */}
            <div
              className="h-2 rounded-xs bg-gold"
              style={{ width: `${(z.anzahl / max) * 100}%` }}
              aria-hidden
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Auswahl({ auswahl }: { auswahl: AuswahlZaehler }) {
  const anteil = (n: number) =>
    auswahl.gesamt === 0 ? 0 : Math.round((n / auswahl.gesamt) * 100);

  return (
    <section className="mt-8 rounded-sm border border-mist bg-surface px-5 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-sm font-bold text-navy">
          Auswahl auf der Startseite
        </h2>
        <span className="text-xs tabular-nums text-ink-muted">
          {auswahl.gesamt} Klicks insgesamt
        </span>
      </div>

      {auswahl.gesamt === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Noch keine Auswahl erfasst.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Privatkunden", wert: auswahl.privat },
            { label: "Geschäftskunden", wert: auswahl.geschaeft },
          ].map((item) => (
            <li key={item.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-navy">{item.label}</span>
                <span className="tabular-nums text-ink-muted">
                  {item.wert} · {anteil(item.wert)} %
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-xs bg-mist">
                <div
                  className="h-2 rounded-xs bg-gold"
                  style={{ width: `${anteil(item.wert)}%` }}
                  aria-hidden
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        Gezählt wird nur die bewusste Auswahl in der Weiche — ohne Cookies,
        Gerätekennung oder Drittanbieter-Analytics.
      </p>
    </section>
  );
}

export function Statistik({
  rows,
  auswahl,
}: {
  rows: BereichZeile[];
  auswahl: AuswahlZaehler;
}) {
  const gruppen: Gruppe[] = [
    { titel: "Geschäftskunden", zeilen: gruppiere(rows, "geschaeft") },
    { titel: "Privatkunden", zeilen: gruppiere(rows, "privat") },
  ];
  const alt = gruppiere(rows, null);
  if (alt.some((z) => z.anzahl > 0)) {
    gruppen.push({ titel: "Vor der Trennung, nicht zugeordnet", zeilen: alt });
  }

  return (
    <>
      <Auswahl auswahl={auswahl} />
      {/* <details> statt Umschalter mit State: kostet null JavaScript, und
          Arians Tagesgeschäft ist die Liste darunter — die Statistik ist ein
          Monatsblick. */}
      <details className="mt-4 rounded-sm border border-mist bg-surface">
        <summary className="cursor-pointer px-5 py-3.5 font-display text-sm font-bold text-navy">
          Welche Bereiche werden angefragt?
        </summary>
        <div className="grid gap-8 border-t border-mist px-5 py-5 sm:grid-cols-2">
          {gruppen.map((g) => (
            <div key={g.titel}>
              <p className="mb-3 font-display text-[0.66rem] font-bold uppercase tracking-[0.2em] text-gold-deep">
                {g.titel}
              </p>
              <Balken zeilen={g.zeilen} />
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
