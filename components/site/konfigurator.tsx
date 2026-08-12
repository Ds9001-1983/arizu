"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Info, MessageCircle } from "lucide-react";
import { business } from "@/lib/business";
import {
  type Values,
  defaultValues,
  estimateRange,
  euro,
  getConfigurator,
  gross,
  summarize,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

/**
 * Der Preis-Konfigurator — das Alleinstellungsmerkmal aus dem Kundengespräch.
 *
 * Der stärkste Wettbewerber im Umkreis (Makur Gebäudedienst, Elmshorn) wirbt
 * mit "Angebot in 60 Sekunden", liefert aber nur ein Kontaktformular ohne
 * Preis. Hier bekommt der Kunde tatsächlich eine Zahl, bevor er Daten abgibt.
 *
 * Bewusst eine SPANNE statt eines Fixpreises: Der Festpreis steht erst nach
 * der Besichtigung fest. So wird die im Gespräch benannte Falle vermieden,
 * online 299 € anzuzeigen und vor Ort 799 € zu berechnen.
 */
export function Konfigurator({
  slug,
  className,
}: {
  /**
   * Nur der Slug wird übergeben, nicht die Spezifikation: `calc` ist eine
   * Funktion und lässt sich nicht von einer Server- in eine Client-Komponente
   * serialisieren. Die Preislogik ist reines TypeScript ohne Server-Abhängig-
   * keiten, also holt sie sich der Client selbst.
   */
  slug: string;
  className?: string;
}) {
  const spec = getConfigurator(slug)!;
  const [values, setValues] = useState<Values>(() => defaultValues(spec));

  const result = useMemo(() => {
    const calc = spec.calc(values);
    const brutto = gross(calc.net);
    return {
      ...calc,
      range: estimateRange(brutto),
      oneOffGross: calc.oneOffNet ? gross(calc.oneOffNet) : undefined,
      summary: summarize(spec, values),
    };
  }, [spec, values]);

  const set = (id: string, v: string | number | string[]) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const toggle = (id: string, optionId: string) =>
    setValues((prev) => {
      const cur = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      return {
        ...prev,
        [id]: cur.includes(optionId)
          ? cur.filter((x) => x !== optionId)
          : [...cur, optionId],
      };
    });

  /** Text, der in Formular, WhatsApp und beide Mails wandert. */
  const handoff =
    `${spec.title.replace(" berechnen", "")}: ${result.summary}. ` +
    `Richtpreis ca. ${euro(result.range.low)}–${euro(result.range.high)} ` +
    `${result.unit} inkl. MwSt.` +
    (result.oneOffGross
      ? ` Zusätzlich einmalig ca. ${euro(result.oneOffGross)} (${result.oneOffLabel}).`
      : "");

  const sendToForm = () => {
    window.dispatchEvent(
      new CustomEvent("arizu:konfigurator", {
        detail: { service: spec.slug, text: handoff },
      }),
    );
    document.getElementById("anfrage")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-sm border border-mist bg-mist lg:grid-cols-[1.35fr_1fr]",
        className,
      )}
    >
      {/* ---------------------------------------------------- Eingabefelder */}
      <div className="bg-surface p-6 sm:p-8">
        <h3 className="font-display text-xl text-navy">{spec.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{spec.intro}</p>

        <div className="mt-8 space-y-8">
          {spec.fields.map((field) => {
            if (field.kind === "number") {
              const value = Number(values[field.id] ?? field.default);
              return (
                <div key={field.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <label
                      htmlFor={`${spec.slug}-${field.id}`}
                      className="text-sm font-semibold text-navy"
                    >
                      {field.label}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        id={`${spec.slug}-${field.id}`}
                        type="number"
                        inputMode="numeric"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={value}
                        onChange={(e) => set(field.id, Number(e.target.value))}
                        className="w-24 rounded-sm border border-mist bg-shell px-2 py-1.5 text-right font-display text-base font-bold text-navy tabular-nums"
                      />
                      <span className="text-sm text-ink-muted">{field.unit}</span>
                    </div>
                  </div>
                  {field.hint && (
                    <p className="mt-1 text-xs text-ink-muted">{field.hint}</p>
                  )}
                  {/* Schieberegler zusätzlich zum Zahlenfeld: am Handy schneller,
                      am Desktop bleibt die exakte Eingabe möglich. */}
                  <input
                    type="range"
                    aria-hidden
                    tabIndex={-1}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={value}
                    onChange={(e) => set(field.id, Number(e.target.value))}
                    className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-mist accent-gold"
                  />
                </div>
              );
            }

            if (field.kind === "select") {
              return (
                <fieldset key={field.id}>
                  <legend className="text-sm font-semibold text-navy">
                    {field.label}
                  </legend>
                  {field.hint && (
                    <p className="mt-1 text-xs text-ink-muted">{field.hint}</p>
                  )}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {field.options.map((opt) => {
                      const active = values[field.id] === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={cn(
                            "flex cursor-pointer flex-col rounded-sm border px-4 py-3 transition-colors",
                            active
                              ? "border-gold bg-gold/8"
                              : "border-mist bg-shell hover:border-gold/50",
                          )}
                        >
                          <span className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name={`${spec.slug}-${field.id}`}
                              value={opt.id}
                              checked={active}
                              onChange={() => set(field.id, opt.id)}
                              className="size-4 accent-gold"
                            />
                            <span className="text-sm font-medium text-navy">
                              {opt.label}
                            </span>
                          </span>
                          {opt.hint && (
                            <span className="mt-1 pl-6.5 text-xs text-ink-muted">
                              {opt.hint}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            }

            const selected = Array.isArray(values[field.id])
              ? (values[field.id] as string[])
              : [];
            return (
              <fieldset key={field.id}>
                <legend className="text-sm font-semibold text-navy">
                  {field.label}
                </legend>
                {field.hint && (
                  <p className="mt-1 text-xs text-ink-muted">{field.hint}</p>
                )}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {field.options.map((opt) => {
                    const active = selected.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={cn(
                          "flex cursor-pointer flex-col rounded-sm border px-4 py-3 transition-colors",
                          active
                            ? "border-gold bg-gold/8"
                            : "border-mist bg-shell hover:border-gold/50",
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggle(field.id, opt.id)}
                            className="size-4 accent-gold"
                          />
                          <span className="text-sm font-medium text-navy">
                            {opt.label}
                          </span>
                        </span>
                        {opt.hint && (
                          <span className="mt-1 pl-6.5 text-xs text-ink-muted">
                            {opt.hint}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------------- Ergebnis */}
      <div className="flex flex-col bg-navy p-6 text-white sm:p-8">
        <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-soft">
          Ihr Richtpreis
        </p>

        <p
          className="mt-4 font-display text-[2.6rem] font-bold leading-none text-gold tabular-nums"
          aria-live="polite"
        >
          {euro(result.range.low)}
          <span className="text-white/40"> – </span>
          {euro(result.range.high)}
        </p>
        <p className="mt-2 text-sm text-white/70">
          {result.unit} · inkl. 19 % MwSt.
        </p>

        {result.oneOffGross && (
          <p className="mt-4 rounded-sm border border-white/15 px-3 py-2.5 text-sm text-white/85">
            Zusätzlich einmalig ca.{" "}
            <span className="font-semibold text-gold-soft">
              {euro(result.oneOffGross)}
            </span>
            <span className="block text-xs text-white/55">{result.oneOffLabel}</span>
          </p>
        )}

        <ul className="mt-6 space-y-2.5 text-xs leading-relaxed text-white/65">
          {result.notes.map((n) => (
            <li key={n} className="flex gap-2">
              <Info className="mt-0.5 size-3.5 shrink-0 text-gold/70" aria-hidden />
              <span>{n}</span>
            </li>
          ))}
          <li className="flex gap-2">
            <Info className="mt-0.5 size-3.5 shrink-0 text-gold/70" aria-hidden />
            <span>
              Unverbindliche Schätzung. Den Festpreis nennen wir nach der
              kostenlosen Besichtigung.
            </span>
          </li>
        </ul>

        <div className="mt-8 space-y-2.5">
          <button
            type="button"
            onClick={sendToForm}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-gold px-5 py-3.5 font-display text-sm font-bold text-navy transition-colors hover:bg-gold-soft"
          >
            Unverbindlich anfragen
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <a
            href={`${business.whatsapp.href}?text=${encodeURIComponent(handoff)}`}
            target="_blank"
            rel="noopener"
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold-soft"
          >
            <MessageCircle className="size-4" aria-hidden />
            Per WhatsApp senden
          </a>
        </div>
      </div>
    </div>
  );
}
