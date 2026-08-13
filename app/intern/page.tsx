import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Container } from "@/components/site/container";
import { dbConfigured, listLeads, type LeadRow } from "@/lib/db";
import { getService } from "@/lib/services";
import { cn } from "@/lib/utils";
import { logout } from "./actions";

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

export default async function InternPage() {
  let leads: LeadRow[] = [];
  let error: string | null = null;

  if (!dbConfigured) {
    error =
      "Es ist keine DATABASE_URL gesetzt. Anfragen laufen aktuell nur per E-Mail — " +
      "sobald die Neon-Datenbank verbunden ist, erscheinen sie hier.";
  } else {
    try {
      leads = await listLeads();
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
              {leads.length} gespeichert
              {offen > 0 && (
                <>
                  {" · "}
                  <strong className="text-gold-deep">{offen} noch offen</strong>
                </>
              )}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-sm border border-mist px-4 py-2 text-sm font-semibold text-navy hover:border-gold"
            >
              Abmelden
            </button>
          </form>
        </div>

        {error && (
          <p className="mt-8 rounded-sm border border-gold/40 bg-gold/8 px-4 py-3 text-sm text-navy">
            {error}
          </p>
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
            Noch keine Anfragen eingegangen.
          </p>
        )}
      </Container>
    </div>
  );
}
