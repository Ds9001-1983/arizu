import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Container } from "@/components/site/container";
import {
  countByService,
  countKundenartAuswahl,
  dbConfigured,
  listLeads,
  type AuswahlZaehler,
  type BereichZeile,
  type KundenartFilter,
  type LeadRow,
} from "@/lib/db";
import { getService } from "@/lib/services";
import { cn } from "@/lib/utils";
import { logout } from "./actions";
import { Statistik } from "./statistik";

export const metadata: Metadata = {
  title: "Anfragen",
  robots: { index: false, follow: false },
};

/* Liest Cookies und Datenbank — darf nie statisch vorgerendert werden. */
export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  neu: "bg-gold text-navy",
  kontaktiert: "bg-navy text-white",
  angebot: "bg-navy-soft text-white",
  gewonnen: "bg-green-700 text-white",
  verloren: "bg-mist text-ink-muted",
};

const kundenartLabel: Record<string, string> = {
  geschaeft: "Geschäftskunde",
  privat: "Privatkunde",
};

const kundenartStyles: Record<string, string> = {
  geschaeft: "bg-navy text-gold-soft",
  privat: "bg-mist text-ink-muted",
};

/* Die Filterleiste sind Links, keine Schaltflächen mit Zustand: Damit bleibt
   diese Seite eine Server Component, der Filter überlebt das revalidatePath
   nach dem Speichern, und die gefilterte Ansicht ist als URL teilbar. */
const filter: { id: KundenartFilter | "alle"; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "geschaeft", label: "Geschäftskunden" },
  { id: "privat", label: "Privatkunden" },
  { id: "ohne", label: "Nicht zugeordnet" },
];

function istFilter(v: string | undefined): KundenartFilter | undefined {
  return v === "geschaeft" || v === "privat" || v === "ohne" ? v : undefined;
}

function when(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function InternPage({
  searchParams,
}: {
  searchParams: Promise<{ kundenart?: string }>;
}) {
  const aktiv = istFilter((await searchParams).kundenart);

  let leads: LeadRow[] = [];
  let bereiche: BereichZeile[] = [];
  let auswahl: AuswahlZaehler = { privat: 0, geschaeft: 0, gesamt: 0 };
  let error: string | null = null;

  if (!dbConfigured) {
    error =
      "Es ist keine DATABASE_URL gesetzt. Anfragen laufen aktuell nur per E-Mail — " +
      "sobald die Neon-Datenbank verbunden ist, erscheinen sie hier.";
  } else {
    try {
      [leads, bereiche, auswahl] = await Promise.all([
        listLeads(200, aktiv),
        countByService(),
        countKundenartAuswahl(),
      ]);
    } catch (err) {
      error =
        "Die Datenbank ist nicht erreichbar. Anfragen kommen weiterhin per E-Mail an.";
      console.error("[ARIZU intern]", err);
    }
  }

  const offen = leads.filter((l) => l.status === "neu").length;

  return (
    <div className="py-10">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-navy">Anfragen</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {leads.length} {aktiv ? "in dieser Ansicht" : "gespeichert"}
              {offen > 0 && (
                <>
                  {" · "}
                  <strong className="text-gold-deep">{offen} noch offen</strong>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/intern/preise"
              className="rounded-sm border border-mist px-4 py-2 text-sm font-semibold text-navy hover:border-gold"
            >
              Preise
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-sm border border-mist px-4 py-2 text-sm font-semibold text-navy hover:border-gold"
              >
                Abmelden
              </button>
            </form>
          </div>
        </div>

        {error && (
          <p className="mt-8 rounded-sm border border-gold/40 bg-gold/8 px-4 py-3 text-sm text-navy">
            {error}
          </p>
        )}

        {!error && (
          <>
            <nav aria-label="Nach Kundenart filtern" className="mt-6 flex flex-wrap gap-2">
              {filter.map((f) => {
                const gewaehlt = f.id === (aktiv ?? "alle");
                return (
                  <Link
                    key={f.id}
                    href={f.id === "alle" ? "/intern" : `/intern?kundenart=${f.id}`}
                    aria-current={gewaehlt ? "page" : undefined}
                    className={cn(
                      "rounded-sm border px-4 py-2 font-display text-sm font-bold transition-colors",
                      gewaehlt
                        ? "border-navy bg-navy text-white"
                        : "border-mist bg-surface text-navy hover:border-gold",
                    )}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </nav>

            <Statistik rows={bereiche} auswahl={auswahl} />
          </>
        )}

        {leads.length > 0 && (
          <ul className="mt-8 space-y-3">
            {leads.map((lead) => (
              <li key={lead.id}>
                <div className="rounded-sm border border-mist bg-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span
                        className={cn(
                          "inline-block rounded-xs px-2 py-0.5 font-display text-[0.66rem] font-bold uppercase tracking-[0.12em]",
                          statusStyles[lead.status] ?? statusStyles.neu,
                        )}
                      >
                        {lead.status}
                      </span>
                      {/* Kein Badge bei leerer Spalte: Diese Zeilen stammen von
                          vor der Trennung, und Schweigen ist das ehrliche
                          Signal für "wissen wir nicht". */}
                      {lead.kundenart && (
                        <span
                          className={cn(
                            "ml-1.5 inline-block rounded-xs px-2 py-0.5 font-display text-[0.66rem] font-bold uppercase tracking-[0.12em]",
                            kundenartStyles[lead.kundenart] ?? kundenartStyles.privat,
                          )}
                        >
                          {kundenartLabel[lead.kundenart] ?? lead.kundenart}
                        </span>
                      )}
                      <h2 className="mt-2 font-display text-lg text-navy">
                        {lead.name}
                        {lead.service && (
                          <span className="ml-2 text-sm font-normal text-ink-muted">
                            · {getService(lead.service)?.name ?? lead.service}
                          </span>
                        )}
                      </h2>
                    </div>
                    <span className="text-xs text-ink-muted tabular-nums">
                      {when(lead.created_at)}
                    </span>
                  </div>

                  {lead.konfigurator && (
                    <p className="mt-3 border-l-2 border-gold pl-3 text-sm leading-relaxed text-ink-muted">
                      {lead.konfigurator}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    {/* Klick-to-Call zuerst: Auf dem Handy beim Kunden ist das
                        die häufigste Aktion in dieser Liste. */}
                    <a
                      href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex items-center gap-2 font-semibold text-navy hover:text-gold-deep"
                    >
                      <Phone className="size-4" aria-hidden />
                      {lead.phone}
                    </a>
                    {(lead.strasse || lead.ort) && (
                      <span className="text-ink-muted">
                        {[lead.strasse, [lead.plz, lead.ort].filter(Boolean).join(" ")]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                    {lead.source === "whatsapp" && (
                      <span className="rounded-xs bg-mist px-2 py-0.5 text-xs text-ink-muted">
                        über WhatsApp
                      </span>
                    )}
                    <Link
                      href={`/intern/${lead.id}`}
                      className="ml-auto inline-flex items-center gap-1.5 font-semibold text-gold-deep hover:text-navy"
                    >
                      Bearbeiten
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!error && leads.length === 0 && (
          <p className="mt-8 text-sm text-ink-muted">
            {aktiv
              ? "In dieser Ansicht steht nichts. Über „Alle“ sehen Sie wieder jede Anfrage."
              : "Noch keine Anfragen eingegangen."}
          </p>
        )}
      </Container>
    </div>
  );
}
