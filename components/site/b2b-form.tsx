"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { whatsappLink } from "@/lib/anfrage-text";
import {
  B2B_LEISTUNGEN,
  B2B_OBJEKTARTEN,
  B2B_RHYTHMEN,
  B2B_WEITERE,
  bedarfText,
  type B2bAngaben,
} from "@/lib/b2b";
import { business } from "@/lib/business";
import { getService } from "@/lib/services";
import { cn } from "@/lib/utils";

/* ==================================================================
   Bedarfsabfrage für Geschäftskunden.

   Eigene Komponente statt eines Schalters an LeadForm: Zehn zusätzliche
   bedingte Felder machten beide Fälle unlesbar, und die B2B-Felder lägen im
   Bundle jeder Seite, die <AnfrageSection> rendert — also auf der Startseite,
   der Kontaktseite und allen vier Leistungsseiten. So zahlt nur
   /geschaeftskunden dafür.

   KEIN Richtpreis. Grundsatz aus dem Kundengespräch vom 14.08.2026: im
   Geschäftskundenbereich zunächst nur die Bedarfsabfrage. Die Kalkulation
   macht Arian nach der Begehung.

   Wie im übrigen Projekt ohne zod im Client (Bundle-Budget, siehe AGENTS.md).
   Verbindlich geprüft wird in app/api/lead/route.ts.
   ================================================================== */

type Status = "idle" | "sending" | "done" | "error";
type Feld =
  | "hauptleistung"
  | "objektart"
  | "objekte"
  | "groesse"
  | "rhythmus"
  | "unternehmen"
  | "name"
  | "phone"
  | "email"
  | "strasse"
  | "plz"
  | "ort"
  | "consent";
type Errors = Partial<Record<Feld, string>>;

const FELD =
  "w-full rounded-sm border border-mist bg-surface px-4 py-3 text-[0.95rem] text-navy placeholder:text-ink-muted/60 focus:border-gold focus:outline-none";
const LABEL = "mb-1.5 block text-sm font-semibold text-navy";
const PFLICHT = <span className="text-gold-deep">*</span>;

const LEER = {
  hauptleistung: "",
  weitere: [] as string[],
  objektart: "",
  objekte: "1",
  einheiten: "",
  flaeche: "",
  rhythmus: "",
  start: "",
  unternehmen: "",
  name: "",
  position: "",
  phone: "",
  email: "",
  strasse: "",
  plz: "",
  ort: "",
  message: "",
  consent: false,
};

export function B2bForm() {
  const [f, setF] = useState({ ...LEER });
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const setzen = (teil: Partial<typeof LEER>) => setF((alt) => ({ ...alt, ...teil }));

  /** Die Angaben in der Form, die bedarfText() erwartet. */
  const angaben: B2bAngaben = {
    hauptleistung: f.hauptleistung || undefined,
    weitere: f.weitere,
    objektart: f.objektart,
    objekte: Number(f.objekte) || 1,
    einheiten: Number(f.einheiten) || undefined,
    flaeche: Number(f.flaeche) || undefined,
    rhythmus: f.rhythmus,
    start: f.start || undefined,
    unternehmen: f.unternehmen,
    position: f.position || undefined,
  };

  function pruefen(): Errors {
    const e: Errors = {};
    if (!f.hauptleistung) e.hauptleistung = "Bitte wählen Sie einen Bereich.";
    if (!f.objektart) e.objektart = "Bitte wählen Sie die Art des Objekts.";
    if (!(Number(f.objekte) >= 1)) e.objekte = "Mindestens ein Objekt.";
    // Eines von beiden genügt: Bei Büro und Ladenlokal ist die Fläche die
    // sinnvollere Größe, bei Wohnanlagen die Zahl der Einheiten.
    if (!f.einheiten && !f.flaeche)
      e.groesse = "Bitte Einheiten oder Fläche angeben — eine Schätzung genügt.";
    if (!f.rhythmus) e.rhythmus = "Bitte wählen Sie einen Rhythmus.";
    if (f.unternehmen.trim().length < 2)
      e.unternehmen = "Bitte den Namen des Unternehmens angeben.";
    if (f.name.trim().length < 2) e.name = "Bitte den Ansprechpartner angeben.";
    if (f.phone.trim().length < 6) e.phone = "Bitte eine Telefonnummer angeben.";
    // Anders als im Privatbereich Pflicht: Ein Angebot über mehrere Objekte
    // geht schriftlich raus, nicht am Telefon.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
      e.email = "Für das schriftliche Angebot brauchen wir eine E-Mail-Adresse.";
    if (f.strasse.trim().length < 3) e.strasse = "Bitte Straße und Hausnummer angeben.";
    if (!/^\d{5}$/.test(f.plz.trim())) e.plz = "Fünfstellige Postleitzahl.";
    if (f.ort.trim().length < 2) e.ort = "Bitte den Ort angeben.";
    if (!f.consent)
      e.consent = "Ohne Ihre Einwilligung dürfen wir die Anfrage nicht verarbeiten.";
    return e;
  }

  async function uebermitteln(quelle: "formular" | "whatsapp") {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: f.name,
        phone: f.phone,
        email: f.email,
        strasse: f.strasse,
        plz: f.plz,
        ort: f.ort,
        message: f.message || undefined,
        source: quelle,
        kundenart: "geschaeft",
        // Den lesbaren Text baut der Server aus diesen Angaben selbst.
        b2b: angaben,
        consent: true,
      }),
      // Beim WhatsApp-Weg verlässt der Browser gleich die Seite.
      keepalive: quelle === "whatsapp",
    });
    const json = (await res.json()) as { ok: boolean; error?: string };
    if (!res.ok || !json.ok) throw new Error(json.error ?? "Unbekannter Fehler");
  }

  function fokus(gefunden: Errors) {
    const erstes = Object.keys(gefunden)[0];
    document.getElementById(`b2b-${erstes}`)?.focus();
  }

  async function absenden(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const gefunden = pruefen();
    setErrors(gefunden);
    if (Object.keys(gefunden).length > 0) return fokus(gefunden);

    setStatus("sending");
    setServerError(null);
    try {
      await uebermitteln("formular");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setServerError(
        err instanceof Error ? err.message : "Die Anfrage konnte nicht gesendet werden.",
      );
    }
  }

  const dienst = getService(f.hauptleistung);
  const waHref = whatsappLink({
    name: f.name || "—",
    strasse: f.strasse,
    plz: f.plz,
    ort: f.ort,
    phone: f.phone,
    email: f.email || undefined,
    message: f.message || undefined,
    leistung: dienst?.name ?? "Anfrage für Geschäftskunden",
    emoji: dienst?.emoji ?? "🏢",
    // Derselbe Text, den der Server speichert — beide rufen bedarfText() auf,
    // sie können also nicht auseinanderlaufen. Ohne Preisrahmen lässt
    // whatsappText den Preisblock weg.
    auswahl: bedarfText(angaben),
  });

  async function whatsappKlick(event: React.MouseEvent<HTMLAnchorElement>) {
    const gefunden = pruefen();
    setErrors(gefunden);
    if (Object.keys(gefunden).length > 0) {
      event.preventDefault();
      return fokus(gefunden);
    }
    // Nicht abwarten: Der Browser soll sofort zu WhatsApp wechseln, der POST
    // läuft dank keepalive zu Ende.
    uebermitteln("whatsapp").catch((err) => console.error("[ARIZU]", err));
  }

  if (status === "done") {
    return (
      <div className="rounded-sm border border-gold/40 bg-gold/8 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-gold-deep" aria-hidden />
        <h3 className="mt-4 font-display text-xl text-navy">
          Danke, {f.name.split(" ")[0]} — Ihre Anfrage ist bei uns.
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
          Wir melden uns innerhalb eines Werktags telefonisch. Danach sehen wir
          uns die Objekte gemeinsam an, und Sie erhalten ein schriftliches
          Angebot mit Leistungsverzeichnis — Preis je Objekt und Monat,
          monatlich kündbar.
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
          Eine Bestätigung ist an {f.email} unterwegs. Wenn es eilt:{" "}
          <a href={business.phone.href} className="font-semibold text-navy underline">
            {business.phone.display}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={absenden} className="space-y-6" noValidate>
      {/* Honeypot */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label htmlFor="b2b-website">Website</label>
        <input id="b2b-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* ------------------------------------------------ Worum geht es? */}
      <fieldset>
        <legend className={LABEL}>Um welchen Bereich geht es hauptsächlich? {PFLICHT}</legend>
        <div className="mt-1 grid gap-2.5 sm:grid-cols-2">
          {B2B_LEISTUNGEN.map((o) => (
            <label
              key={o.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 text-sm transition-colors",
                f.hauptleistung === o.id
                  ? "border-gold bg-gold/8 text-navy"
                  : "border-mist bg-shell text-navy hover:border-gold/50",
              )}
            >
              <input
                type="radio"
                name="hauptleistung"
                id={o.id === B2B_LEISTUNGEN[0].id ? "b2b-hauptleistung" : undefined}
                checked={f.hauptleistung === o.id}
                onChange={() => setzen({ hauptleistung: o.id })}
                className="size-4 shrink-0 accent-gold"
              />
              {o.label}
            </label>
          ))}
        </div>
        {errors.hauptleistung && <Err>{errors.hauptleistung}</Err>}
      </fieldset>

      <fieldset>
        <legend className={LABEL}>Weitere gewünschte Bereiche</legend>
        <div className="mt-1 grid gap-2.5 sm:grid-cols-2">
          {B2B_WEITERE.map((o) => {
            const an = f.weitere.includes(o.id);
            return (
              <label
                key={o.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 text-sm transition-colors",
                  an
                    ? "border-gold bg-gold/8 text-navy"
                    : "border-mist bg-shell text-navy hover:border-gold/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={an}
                  onChange={() =>
                    setzen({
                      weitere: an
                        ? f.weitere.filter((x) => x !== o.id)
                        : [...f.weitere, o.id],
                    })
                  }
                  className="size-4 shrink-0 accent-gold"
                />
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* ------------------------------------------- Wie groß ist der Bedarf? */}
      <div className="border-t border-mist pt-6">
        <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Wie groß ist der Bedarf?
        </p>
      </div>

      <div>
        <label htmlFor="b2b-objektart" className={LABEL}>
          Art des Objekts {PFLICHT}
        </label>
        <select
          id="b2b-objektart"
          value={f.objektart}
          onChange={(e) => setzen({ objektart: e.target.value })}
          aria-invalid={Boolean(errors.objektart)}
          className={FELD}
        >
          <option value="">Bitte wählen</option>
          {B2B_OBJEKTARTEN.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.objektart && <Err>{errors.objektart}</Err>}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="b2b-objekte" className={LABEL}>
            Anzahl Objekte {PFLICHT}
          </label>
          <input
            id="b2b-objekte"
            type="number"
            min={1}
            max={200}
            inputMode="numeric"
            value={f.objekte}
            onChange={(e) => setzen({ objekte: e.target.value })}
            aria-invalid={Boolean(errors.objekte)}
            className={FELD}
          />
          {errors.objekte && <Err>{errors.objekte}</Err>}
        </div>
        <div>
          <label htmlFor="b2b-groesse" className={LABEL}>
            Einheiten
          </label>
          <input
            id="b2b-groesse"
            type="number"
            min={0}
            max={5000}
            inputMode="numeric"
            value={f.einheiten}
            onChange={(e) => setzen({ einheiten: e.target.value })}
            aria-invalid={Boolean(errors.groesse)}
            className={FELD}
          />
          <p className="mt-1.5 text-xs text-ink-muted">Wohn- oder Gewerbeeinheiten.</p>
        </div>
        <div>
          <label htmlFor="b2b-flaeche" className={LABEL}>
            Fläche insgesamt
          </label>
          <input
            id="b2b-flaeche"
            type="number"
            min={0}
            max={200000}
            inputMode="numeric"
            value={f.flaeche}
            onChange={(e) => setzen({ flaeche: e.target.value })}
            aria-invalid={Boolean(errors.groesse)}
            className={FELD}
          />
          <p className="mt-1.5 text-xs text-ink-muted">in m², eine Schätzung genügt.</p>
        </div>
      </div>
      {errors.groesse && <Err>{errors.groesse}</Err>}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="b2b-rhythmus" className={LABEL}>
            Gewünschter Rhythmus {PFLICHT}
          </label>
          <select
            id="b2b-rhythmus"
            value={f.rhythmus}
            onChange={(e) => setzen({ rhythmus: e.target.value })}
            aria-invalid={Boolean(errors.rhythmus)}
            className={FELD}
          >
            <option value="">Bitte wählen</option>
            {B2B_RHYTHMEN.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.rhythmus && <Err>{errors.rhythmus}</Err>}
        </div>
        <div>
          <label htmlFor="b2b-start" className={LABEL}>
            Gewünschter Start
          </label>
          <input
            id="b2b-start"
            type="date"
            value={f.start}
            onChange={(e) => setzen({ start: e.target.value })}
            className={FELD}
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Leer lassen, wenn der Termin noch offen ist.
          </p>
        </div>
      </div>

      {/* --------------------------------------------------------- Wo? */}
      <div className="border-t border-mist pt-6">
        <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Wo liegt das Objekt?
        </p>
        <p className="mt-1.5 text-xs text-ink-muted">
          Bei mehreren Objekten genügt die Hauptadresse.
        </p>
      </div>

      <div>
        <label htmlFor="b2b-strasse" className={LABEL}>
          Straße und Hausnummer {PFLICHT}
        </label>
        <input
          id="b2b-strasse"
          autoComplete="street-address"
          value={f.strasse}
          onChange={(e) => setzen({ strasse: e.target.value })}
          aria-invalid={Boolean(errors.strasse)}
          className={FELD}
        />
        {errors.strasse && <Err>{errors.strasse}</Err>}
      </div>

      <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
        <div>
          <label htmlFor="b2b-plz" className={LABEL}>
            PLZ {PFLICHT}
          </label>
          <input
            id="b2b-plz"
            inputMode="numeric"
            maxLength={5}
            autoComplete="postal-code"
            value={f.plz}
            onChange={(e) => setzen({ plz: e.target.value })}
            aria-invalid={Boolean(errors.plz)}
            className={FELD}
          />
          {errors.plz && <Err>{errors.plz}</Err>}
        </div>
        <div>
          <label htmlFor="b2b-ort" className={LABEL}>
            Ort {PFLICHT}
          </label>
          <input
            id="b2b-ort"
            autoComplete="address-level2"
            value={f.ort}
            onChange={(e) => setzen({ ort: e.target.value })}
            aria-invalid={Boolean(errors.ort)}
            className={FELD}
          />
          {errors.ort && <Err>{errors.ort}</Err>}
        </div>
      </div>

      {/* -------------------------------------------------- Wer sind Sie? */}
      <div className="border-t border-mist pt-6">
        <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Wie erreichen wir Sie?
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="b2b-unternehmen" className={LABEL}>
            Unternehmen {PFLICHT}
          </label>
          <input
            id="b2b-unternehmen"
            autoComplete="organization"
            value={f.unternehmen}
            onChange={(e) => setzen({ unternehmen: e.target.value })}
            aria-invalid={Boolean(errors.unternehmen)}
            className={FELD}
          />
          {errors.unternehmen && <Err>{errors.unternehmen}</Err>}
        </div>
        <div>
          <label htmlFor="b2b-position" className={LABEL}>
            Position oder Funktion
          </label>
          <input
            id="b2b-position"
            autoComplete="organization-title"
            placeholder="z. B. Hausverwaltung, Facility Management"
            value={f.position}
            onChange={(e) => setzen({ position: e.target.value })}
            className={FELD}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="b2b-name" className={LABEL}>
            Ansprechpartner {PFLICHT}
          </label>
          <input
            id="b2b-name"
            autoComplete="name"
            value={f.name}
            onChange={(e) => setzen({ name: e.target.value })}
            aria-invalid={Boolean(errors.name)}
            className={FELD}
          />
          {errors.name && <Err>{errors.name}</Err>}
        </div>
        <div>
          <label htmlFor="b2b-phone" className={LABEL}>
            Telefon {PFLICHT}
          </label>
          <input
            id="b2b-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={f.phone}
            onChange={(e) => setzen({ phone: e.target.value })}
            aria-invalid={Boolean(errors.phone)}
            className={FELD}
          />
          {errors.phone && <Err>{errors.phone}</Err>}
        </div>
        <div>
          <label htmlFor="b2b-email" className={LABEL}>
            E-Mail {PFLICHT}
          </label>
          <input
            id="b2b-email"
            type="email"
            autoComplete="email"
            value={f.email}
            onChange={(e) => setzen({ email: e.target.value })}
            aria-invalid={Boolean(errors.email)}
            className={FELD}
          />
          {errors.email && <Err>{errors.email}</Err>}
        </div>
      </div>

      <div>
        <label htmlFor="b2b-message" className={LABEL}>
          Weitere Angaben
        </label>
        <textarea
          id="b2b-message"
          rows={4}
          value={f.message}
          onChange={(e) => setzen({ message: e.target.value })}
          className={FELD}
        />
      </div>

      <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink-muted">
        <input
          id="b2b-consent"
          type="checkbox"
          checked={f.consent}
          onChange={(e) => setzen({ consent: e.target.checked })}
          className="mt-0.5 size-4 shrink-0 accent-gold"
        />
        <span>
          Ich bin damit einverstanden, dass meine Angaben zur Bearbeitung meiner
          Anfrage gespeichert und verarbeitet werden. Details in der{" "}
          <a href="/datenschutz" className="underline hover:text-navy">
            Datenschutzerklärung
          </a>
          . {PFLICHT}
        </span>
      </label>
      {errors.consent && <Err>{errors.consent}</Err>}

      {status === "error" && (
        <p className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {serverError} Bitte rufen Sie uns an:{" "}
          <a href={business.phone.href} className="font-semibold underline">
            {business.phone.display}
          </a>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 font-display text-sm font-bold text-white transition-colors hover:bg-navy-band disabled:opacity-60"
        >
          {status === "sending" ? "Wird gesendet …" : "Bedarf übermitteln"}
          <ArrowRight className="size-4" aria-hidden />
        </button>
        {business.whatsappEnabled && (
          <a
            href={waHref}
            data-whatsapp
            target="_blank"
            rel="noopener"
            onClick={whatsappKlick}
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold-deep"
          >
            Lieber per WhatsApp schicken
          </a>
        )}
        <a
          href={business.phone.href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold-deep"
        >
          <Phone className="size-4" aria-hidden />
          {business.phone.display}
        </a>
      </div>
    </form>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-sm text-red-700">
      {children}
    </p>
  );
}
