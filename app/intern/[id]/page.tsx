import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/site/container";
import { dbConfigured, getLead } from "@/lib/db";
import { getService, services } from "@/lib/services";
import { saveLead } from "../actions";

export const metadata: Metadata = {
  title: "Anfrage bearbeiten",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const statuses = [
  { id: "neu", label: "Neu" },
  { id: "kontaktiert", label: "Kontaktiert" },
  { id: "angebot", label: "Angebot raus" },
  { id: "gewonnen", label: "Gewonnen" },
  { id: "verloren", label: "Verloren" },
];

export default async function LeadDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gespeichert?: string }>;
}) {
  const { id } = await params;
  const { gespeichert } = await searchParams;
  if (!dbConfigured) notFound();

  const lead = await getLead(Number(id));
  if (!lead) notFound();

  const field =
    "w-full rounded-sm border border-mist bg-surface px-3.5 py-2.5 text-[0.95rem] text-navy focus:border-gold focus:outline-none";
  const label = "mb-1.5 block text-sm font-semibold text-navy";
  const waNumber = lead.phone.replace(/[^\d]/g, "").replace(/^0/, "49");

  return (
    <div className="py-10">
      <Container>
        <Link
          href="/intern"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-navy"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Alle Anfragen
        </Link>

        {gespeichert && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-sm border border-green-300 bg-green-50 px-4 py-2.5 text-sm text-green-900">
            <CheckCircle2 className="size-4" aria-hidden />
            Änderungen gespeichert.
          </p>
        )}

        <h1 className="mt-6 font-display text-2xl text-navy">
          {lead.name}
          {lead.service && (
            <span className="ml-2 text-base font-normal text-ink-muted">
              · {getService(lead.service)?.name ?? lead.service}
            </span>
          )}
        </h1>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-2 rounded-sm bg-navy px-5 py-3 font-display text-sm font-bold text-white hover:bg-navy-band"
          >
            <Phone className="size-4" aria-hidden />
            Anrufen
          </a>
          {(lead.strasse || lead.ort) && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                [lead.strasse, [lead.plz, lead.ort].filter(Boolean).join(" ")]
                  .filter(Boolean)
                  .join(", "),
              )}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-sm border border-mist px-5 py-3 font-display text-sm font-bold text-navy hover:border-gold"
            >
              <MapPin className="size-4" aria-hidden />
              Auf Karte zeigen
            </a>
          )}
          <a
            href={`https://api.whatsapp.com/send?phone=${waNumber}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-sm border border-mist px-5 py-3 font-display text-sm font-bold text-navy hover:border-gold"
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </a>
        </div>

        <form action={saveLead} className="mt-9 max-w-2xl space-y-5">
          <input type="hidden" name="id" value={lead.id} />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={label}>
                Name
              </label>
              <input id="name" name="name" defaultValue={lead.name} className={field} />
            </div>
            <div>
              <label htmlFor="phone" className={label}>
                Telefon
              </label>
              <input id="phone" name="phone" defaultValue={lead.phone} className={field} />
            </div>
            <div>
              <label htmlFor="email" className={label}>
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                defaultValue={lead.email ?? ""}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="status" className={label}>
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={lead.status}
                className={field}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="pt-2 font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
            Einsatzort
          </p>

          <div>
            <label htmlFor="strasse" className={label}>
              Straße und Hausnummer
            </label>
            <input
              id="strasse"
              name="strasse"
              defaultValue={lead.strasse ?? ""}
              className={field}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
            <div>
              <label htmlFor="plz" className={label}>
                PLZ
              </label>
              <input id="plz" name="plz" defaultValue={lead.plz ?? ""} className={field} />
            </div>
            <div>
              <label htmlFor="ort" className={label}>
                Ort
              </label>
              <input id="ort" name="ort" defaultValue={lead.ort ?? ""} className={field} />
            </div>
          </div>

          <div>
            <label htmlFor="konfigurator" className={label}>
              Angaben aus dem Konfigurator
            </label>
            <textarea
              id="konfigurator"
              name="konfigurator"
              rows={4}
              defaultValue={lead.konfigurator ?? ""}
              className={field}
            />
            <p className="mt-1.5 text-xs text-ink-muted">
              Hier korrigieren, wenn die Angaben vor Ort abweichen — etwa 74 m²
              statt der gemeldeten 60.
            </p>
          </div>

          {lead.message && (
            <div>
              <p className={label}>Nachricht des Kunden</p>
              <p className="whitespace-pre-line rounded-sm border border-mist bg-shell px-3.5 py-3 text-[0.95rem] leading-relaxed text-ink-muted">
                {lead.message}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="note" className={label}>
              Interne Notiz
            </label>
            <textarea
              id="note"
              name="note"
              rows={4}
              defaultValue={lead.note ?? ""}
              placeholder="Was wurde besprochen? Wann ist der Termin?"
              className={field}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="submit"
              className="rounded-sm bg-gold px-6 py-3.5 font-display text-sm font-bold text-navy transition-colors hover:bg-gold-soft"
            >
              Speichern
            </button>
            {/* Platzhalter für Stufe 2: Datensatz per LexOffice-API in einen
                Angebotsentwurf schieben. Bewusst deaktiviert, damit klar ist,
                wo der Anschluss sitzt. */}
            <button
              type="button"
              disabled
              title="Kommt in Stufe 2: Angebotsentwurf automatisch in LexWare anlegen"
              className="cursor-not-allowed rounded-sm border border-mist px-6 py-3.5 font-display text-sm font-bold text-ink-muted/60"
            >
              An LexOffice senden
            </button>
          </div>
        </form>

        <p className="mt-10 text-xs text-ink-muted">
          Eingegangen am{" "}
          {new Date(lead.created_at).toLocaleString("de-DE", {
            dateStyle: "long",
            timeStyle: "short",
          })}
          {" · "}
          {services.length} Leistungsbereiche im Katalog
        </p>
      </Container>
    </div>
  );
}
