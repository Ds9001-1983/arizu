"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { business } from "@/lib/business";
import { services } from "@/lib/services";

/* ==================================================================
   Allgemeines Anfrageformular am Seitenende.

   Es ist der Weg für alle, die keinen Preis ausrechnen wollen, sondern
   einfach eine Frage haben. Anfragen AUS dem Konfigurator laufen nicht mehr
   hier durch — der bringt seinen eigenen zweiten Schritt mit. Vorher wurde
   das Ergebnis als Fließtext in eine Textarea geschoben; das war eine
   Zwischenlösung und sah auch danach aus.

   Bewusst OHNE react-hook-form, zod und @hookform/resolvers im Client:
   Diese drei zusammen lagen bei rund 100 KB im Initial-Bundle und rissen das
   Performance-Budget von 150 KB. Für sieben Felder leisten sie nichts, was
   die native Constraint-Validation des Browsers nicht auch kann.

   Wichtig: Die Prüfung hier ist Bequemlichkeit für den Nutzer. Verbindlich
   geprüft wird mit zod in app/api/lead/route.ts — Clientprüfungen sind keine
   Sicherheitsgrenze und waren es nie.
   ================================================================== */

type Status = "idle" | "sending" | "done" | "error";
type Errors = Partial<
  Record<"name" | "strasse" | "plz" | "ort" | "phone" | "email" | "consent", string>
>;

const FELD =
  "w-full rounded-sm border border-mist bg-surface px-4 py-3 text-[0.95rem] text-navy placeholder:text-ink-muted/60 focus:border-gold focus:outline-none";
const LABEL = "mb-1.5 block text-sm font-semibold text-navy";

export function LeadForm({ defaultService }: { defaultService?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  function validate(data: Record<string, string>): Errors {
    const e: Errors = {};
    if (data.name.trim().length < 2) e.name = "Bitte geben Sie Ihren Namen an.";
    if (data.strasse.trim().length < 3) e.strasse = "Bitte Straße und Hausnummer angeben.";
    if (!/^\d{5}$/.test(data.plz.trim())) e.plz = "Fünfstellige Postleitzahl.";
    if (data.ort.trim().length < 2) e.ort = "Bitte den Ort angeben.";
    if (data.phone.trim().length < 6)
      e.phone = "Bitte geben Sie eine Telefonnummer an, unter der wir Sie erreichen.";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim()))
      e.email = "Bitte prüfen Sie die E-Mail-Adresse.";
    if (data.consent !== "on")
      e.consent = "Ohne Ihre Einwilligung dürfen wir die Anfrage nicht verarbeiten.";
    return e;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const data = Object.fromEntries(
      [...fd.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]),
    ) as Record<string, string>;
    // Nicht angehakte Checkboxen fehlen in FormData komplett.
    data.consent = fd.get("consent") ? "on" : "";

    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }

    setStatus("sending");
    setServerError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // kundenart ausdrücklich mitschicken statt weglassen: Sonst wären
        // neue Anfragen nicht von den Altbeständen zu unterscheiden, die vor
        // der Trennung eingingen. So heißt eine leere Spalte unmissverständlich
        // "kam rein, bevor es die Weiche gab".
        body: JSON.stringify({
          ...data,
          source: "formular",
          kundenart: "privat",
          consent: true,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Unbekannter Fehler");
      setStatus("done");
      form.reset();
    } catch (err) {
      setStatus("error");
      setServerError(
        err instanceof Error ? err.message : "Die Anfrage konnte nicht gesendet werden.",
      );
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-sm border border-gold/40 bg-gold/8 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-gold-deep" aria-hidden />
        <h3 className="mt-4 font-display text-xl text-navy">Anfrage ist angekommen</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          Wir melden uns in der Regel noch am selben Werktag. Wenn es eilt,
          erreichen Sie uns direkt unter{" "}
          <a href={business.phone.href} className="font-semibold text-navy underline">
            {business.phone.display}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* Honeypot — visuell und für Screenreader entfernt, Bots füllen ihn trotzdem. */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={LABEL}>
            Name <span className="text-gold-deep">*</span>
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            className={FELD}
          />
          {errors.name && <Err>{errors.name}</Err>}
        </div>

        <div>
          <label htmlFor="phone" className={LABEL}>
            Telefon <span className="text-gold-deep">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            className={FELD}
          />
          {errors.phone && <Err>{errors.phone}</Err>}
        </div>
      </div>

      {/* Einsatzort, nicht Wohnadresse — siehe Konfigurator. */}
      <div className="border-t border-mist pt-5">
        <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
          Wo soll gearbeitet werden?
        </p>
        <p className="mt-1.5 text-xs text-ink-muted">
          Adresse des Objekts — muss nicht Ihre eigene Adresse sein.
        </p>
      </div>

      <div>
        <label htmlFor="strasse" className={LABEL}>
          Straße und Hausnummer <span className="text-gold-deep">*</span>
        </label>
        <input
          id="strasse"
          name="strasse"
          autoComplete="street-address"
          required
          aria-invalid={Boolean(errors.strasse)}
          className={FELD}
        />
        {errors.strasse && <Err>{errors.strasse}</Err>}
      </div>

      <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
        <div>
          <label htmlFor="plz" className={LABEL}>
            PLZ <span className="text-gold-deep">*</span>
          </label>
          <input
            id="plz"
            name="plz"
            inputMode="numeric"
            maxLength={5}
            autoComplete="postal-code"
            required
            aria-invalid={Boolean(errors.plz)}
            className={FELD}
          />
          {errors.plz && <Err>{errors.plz}</Err>}
        </div>
        <div>
          <label htmlFor="ort" className={LABEL}>
            Ort <span className="text-gold-deep">*</span>
          </label>
          <input
            id="ort"
            name="ort"
            autoComplete="address-level2"
            required
            aria-invalid={Boolean(errors.ort)}
            className={FELD}
          />
          {errors.ort && <Err>{errors.ort}</Err>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={LABEL}>
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className={FELD}
          />
          <p className="mt-1 text-xs text-ink-muted">
            Für die Bestätigung Ihrer Anfrage — sonst rufen wir einfach an.
          </p>
          {errors.email && <Err>{errors.email}</Err>}
        </div>

        <div>
          <label htmlFor="service" className={LABEL}>
            Worum geht es?
          </label>
          <select
            id="service"
            name="service"
            defaultValue={defaultService ?? ""}
            className={FELD}
          >
            <option value="">Bitte wählen</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className={LABEL}>
          Ihre Nachricht
        </label>
        <textarea id="message" name="message" rows={4} className={FELD} />
      </div>

      <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink-muted">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 size-4 shrink-0 accent-gold"
        />
        <span>
          Ich bin damit einverstanden, dass meine Angaben zur Bearbeitung meiner
          Anfrage gespeichert und verarbeitet werden. Details in der{" "}
          <a href="/datenschutz" className="underline hover:text-navy">
            Datenschutzerklärung
          </a>
          . <span className="text-gold-deep">*</span>
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
          {status === "sending" ? "Wird gesendet …" : "Anfrage senden"}
          <ArrowRight className="size-4" aria-hidden />
        </button>
        <a
          href={business.phone.href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold-deep"
        >
          <Phone className="size-4" aria-hidden />
          Lieber anrufen: {business.phone.display}
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
