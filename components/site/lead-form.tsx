"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { business } from "@/lib/business";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

/* ==================================================================
   Anfrageformular.

   Bewusst OHNE react-hook-form, zod und @hookform/resolvers im Client:
   Diese drei zusammen lagen bei rund 100 KB im Initial-Bundle und rissen das
   Performance-Budget (150 KB) — gemessen wurden 256 KB, mobiler LCP 4,1 s.
   Für sieben Felder leisten sie nichts, was die native Constraint-Validation
   des Browsers nicht auch kann.

   Wichtig: Die Validierung hier ist reine Bequemlichkeit für den Nutzer. Die
   verbindliche Prüfung passiert weiter mit zod in app/api/lead/route.ts —
   Clientprüfungen sind keine Sicherheitsgrenze und waren es nie.
   ================================================================== */

type Status = "idle" | "sending" | "done" | "error";
type Errors = Partial<Record<"name" | "phone" | "email" | "consent", string>>;

const FELD =
  "w-full rounded-sm border border-mist bg-surface px-4 py-3 text-[0.95rem] text-navy placeholder:text-ink-muted/60 focus:border-gold focus:outline-none";

export function LeadForm({ defaultService }: { defaultService?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const konfiguratorRef = useRef<HTMLTextAreaElement>(null);

  // Der Konfigurator schickt sein Ergebnis per CustomEvent herüber, statt den
  // State über die halbe Seite durchzureichen. Beide können dadurch
  // unabhängig voneinander auf jeder Seite stehen.
  useEffect(() => {
    const onResult = (e: Event) => {
      const detail = (e as CustomEvent<{ service?: string; text: string }>).detail;
      const form = formRef.current;
      if (!form) return;

      const feld = form.elements.namedItem("konfigurator") as HTMLTextAreaElement | null;
      if (feld) feld.value = detail.text;

      const auswahl = form.elements.namedItem("service") as HTMLSelectElement | null;
      if (auswahl && detail.service) auswahl.value = detail.service;

      konfiguratorRef.current?.classList.add("ring-2", "ring-gold");
      window.setTimeout(
        () => konfiguratorRef.current?.classList.remove("ring-2", "ring-gold"),
        1600,
      );
    };
    window.addEventListener("arizu:konfigurator", onResult);
    return () => window.removeEventListener("arizu:konfigurator", onResult);
  }, []);

  /** Gleiche Regeln wie im Server-Schema, nur mit deutschen Hinweistexten. */
  function validate(data: Record<string, string>): Errors {
    const e: Errors = {};
    if (data.name.trim().length < 2) e.name = "Bitte geben Sie Ihren Namen an.";
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
      // Zum ersten Fehler springen — auf dem Handy sonst unsichtbar.
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
        body: JSON.stringify({ ...data, consent: true }),
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
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* Honeypot — visuell und für Screenreader entfernt, Bots füllen ihn trotzdem. */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-navy">
            Name <span className="text-gold-deep">*</span>
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-fehler" : undefined}
            className={FELD}
          />
          {errors.name && <Err id="name-fehler">{errors.name}</Err>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-navy">
            Telefon <span className="text-gold-deep">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            minLength={6}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-fehler" : undefined}
            className={FELD}
          />
          {errors.phone && <Err id="phone-fehler">{errors.phone}</Err>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy">
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-fehler" : "email-hinweis"}
            className={FELD}
          />
          <p id="email-hinweis" className="mt-1 text-xs text-ink-muted">
            Für die Bestätigung Ihrer Anfrage — sonst rufen wir einfach an.
          </p>
          {errors.email && <Err id="email-fehler">{errors.email}</Err>}
        </div>

        <div>
          <label htmlFor="service" className="mb-1.5 block text-sm font-semibold text-navy">
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
        <label htmlFor="objekt" className="mb-1.5 block text-sm font-semibold text-navy">
          Wo ist das Objekt?
        </label>
        <input
          id="objekt"
          name="objekt"
          className={FELD}
          placeholder="Straße und Ort — für die Einschätzung der Anfahrt"
        />
      </div>

      <div>
        <label
          htmlFor="konfigurator"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          Ihre Angaben aus dem Konfigurator
        </label>
        <textarea
          id="konfigurator"
          name="konfigurator"
          ref={konfiguratorRef}
          rows={3}
          className={cn(FELD, "transition-shadow")}
          placeholder="Wird automatisch ausgefüllt, sobald Sie oben auf „Unverbindlich anfragen“ klicken."
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-navy">
          Ihre Nachricht
        </label>
        <textarea id="message" name="message" rows={4} className={FELD} />
      </div>

      <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink-muted">
        <input
          type="checkbox"
          name="consent"
          required
          aria-describedby={errors.consent ? "consent-fehler" : undefined}
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
      {errors.consent && <Err id="consent-fehler">{errors.consent}</Err>}

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

function Err({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-700">
      {children}
    </p>
  );
}
