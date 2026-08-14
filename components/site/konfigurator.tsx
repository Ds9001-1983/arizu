"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, MessageCircle, Phone } from "lucide-react";
import { whatsappLink, whatsappText, type AnfrageDaten } from "@/lib/anfrage-text";
import { business } from "@/lib/business";
import {
  type Rates,
  type Values,
  defaultValues,
  estimateRange,
  euro,
  getConfigurator,
  gross,
  summarize,
} from "@/lib/pricing";
import { getService } from "@/lib/services";
import { cn } from "@/lib/utils";

/**
 * Der Preis-Konfigurator — das Alleinstellungsmerkmal aus dem Kundengespräch.
 *
 * Der stärkste Wettbewerber im Umkreis (Makur Gebäudedienst, Elmshorn) wirbt
 * mit "Angebot in 60 Sekunden", liefert aber nur ein Kontaktformular ohne
 * Preis. Hier bekommt der Kunde tatsächlich eine Zahl, bevor er Daten abgibt.
 *
 * Zwei Schritte in derselben Karte:
 *   1. Rechnen — Eingaben und Richtpreis, ohne jede Datenabfrage
 *   2. Angaben — Name, Adresse, Telefon
 *
 * Warum die Angaben zwingend sind: Eine Anfrage ohne Namen und Adresse ist
 * keine Anfrage, sondern eine Preisauskunft an einen Unbekannten. Arian kann
 * damit nichts anfangen — er braucht die Adresse für Anfahrt und Aufwand und
 * die Nummer, um den Vor-Ort-Termin zu machen. Deshalb liegt der
 * WhatsApp-Weg auch erst in Schritt 2 und nicht schon beim Preis.
 *
 * Bewusst eine SPANNE statt eines Fixpreises: Der Festpreis steht erst nach
 * der Besichtigung fest. So wird die im Gespräch benannte Falle vermieden,
 * online 299 € anzuzeigen und vor Ort 799 € zu berechnen.
 */

type Schritt = "rechner" | "angaben" | "fertig";
type Felder = {
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
};
type Fehler = Partial<Record<keyof Felder, string>>;

const LEER: Felder = {
  name: "",
  strasse: "",
  plz: "",
  ort: "",
  phone: "",
  email: "",
  message: "",
  consent: false,
};

const FELD =
  "w-full rounded-sm border border-mist bg-shell px-3.5 py-2.5 text-[0.95rem] text-navy placeholder:text-ink-muted/60 focus:border-gold focus:outline-none";

export function Konfigurator({
  slug,
  rates,
  className,
}: {
  /**
   * Nur der Slug wird übergeben, nicht die Spezifikation: `calc` ist eine
   * Funktion und lässt sich nicht von einer Server- in eine Client-Komponente
   * serialisieren. Die Preislogik ist reines TypeScript ohne
   * Server-Abhängigkeiten, also holt sie sich der Client selbst.
   */
  slug: string;
  /**
   * Die geltenden Preissätze. Anders als `calc` sind das reine Zahlen und
   * damit sehr wohl serialisierbar — die Server-Komponente lädt Arians
   * Überschreibungen aus der Datenbank und reicht sie hier durch.
   *
   * Bewusst PFLICHT und ohne Default: Ein Default machte aus einer vergessenen
   * Aufrufstelle einen stillen Fehler mit alten Preisen statt eines
   * Compilerfehlers.
   */
  rates: Rates;
  className?: string;
}) {
  const spec = getConfigurator(slug)!;
  const leistung = getService(slug)?.name ?? slug;

  const [values, setValues] = useState<Values>(() => defaultValues(spec));
  const [schritt, setSchritt] = useState<Schritt>("rechner");
  const [felder, setFelder] = useState<Felder>(LEER);
  const [fehler, setFehler] = useState<Fehler>({});
  const [sendet, setSendet] = useState(false);
  const [serverFehler, setServerFehler] = useState<string | null>(null);

  const result = useMemo(() => {
    const calc = spec.calc(values, rates);
    const brutto = gross(calc.net);
    return {
      ...calc,
      range: estimateRange(brutto),
      oneOffGross: calc.oneOffNet ? gross(calc.oneOffNet) : undefined,
      summary: summarize(spec, values),
    };
    // `rates` gehört in die Liste: Auf der Startseite wechselt der Besucher
    // den Rechner, ohne dass die Komponente neu montiert wird.
  }, [spec, values, rates]);

  const preisKurz = `ca. ${euro(result.range.low)} – ${euro(result.range.high)}`;
  const einmaligZeile = result.oneOffGross
    ? `Dazu einmalig ca. ${euro(result.oneOffGross)} (${result.oneOffLabel}).`
    : undefined;

  /** Kompakter Text der Anfrage — geht in Mail und Lead-Inbox. */
  const anfrageText =
    `${leistung}: ${result.summary}. Richtpreis ${preisKurz} ${result.unit} inkl. MwSt.` +
    (einmaligZeile ? ` ${einmaligZeile}` : "");

  /** Datensatz für die WhatsApp-Nachricht. */
  const nachrichtDaten: AnfrageDaten = {
    ...felder,
    email: felder.email || undefined,
    message: felder.message || undefined,
    leistung,
    emoji: getService(slug)?.emoji,
    auswahl: result.summary,
    richtpreis: preisKurz,
    einheit: result.unit,
    einmalig: einmaligZeile,
  };

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

  const setFeld = (k: keyof Felder, v: string | boolean) =>
    setFelder((prev) => ({ ...prev, [k]: v }));

  /** Gleiche Regeln wie im Server-Schema, nur mit deutschen Hinweistexten. */
  function pruefen(): Fehler {
    const f: Fehler = {};
    if (felder.name.trim().length < 2) f.name = "Bitte geben Sie Ihren Namen an.";
    if (felder.strasse.trim().length < 3) f.strasse = "Bitte Straße und Hausnummer angeben.";
    if (!/^\d{5}$/.test(felder.plz.trim())) f.plz = "Fünfstellige Postleitzahl.";
    if (felder.ort.trim().length < 2) f.ort = "Bitte den Ort angeben.";
    if (felder.phone.trim().length < 6)
      f.phone = "Bitte eine Telefonnummer angeben, unter der wir Sie erreichen.";
    if (felder.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(felder.email.trim()))
      f.email = "Bitte prüfen Sie die E-Mail-Adresse.";
    if (!felder.consent) f.consent = "Ohne Ihre Einwilligung dürfen wir die Anfrage nicht verarbeiten.";
    return f;
  }

  /** Sendet den Datensatz an den Server. */
  async function uebermitteln(quelle: "formular" | "whatsapp") {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...felder,
        service: slug,
        konfigurator: anfrageText,
        source: quelle,
        // Der Rechner steht ausschließlich im Privatkundenbereich.
        kundenart: "privat",
        consent: true,
      }),
      // keepalive: Beim WhatsApp-Weg verlässt der Browser gleich die Seite.
      // Ohne das würde die Anfrage mitten im Flug abgebrochen und der Lead
      // ginge verloren, obwohl der Kunde alles ausgefüllt hat.
      keepalive: quelle === "whatsapp",
    });
    const json = (await res.json()) as { ok: boolean; error?: string };
    if (!res.ok || !json.ok) throw new Error(json.error ?? "Unbekannter Fehler");
  }

  async function absenden() {
    const gefunden = pruefen();
    setFehler(gefunden);
    if (Object.keys(gefunden).length > 0) {
      document.getElementById(`k-${slug}-${Object.keys(gefunden)[0]}`)?.focus();
      return;
    }
    setSendet(true);
    setServerFehler(null);
    try {
      await uebermitteln("formular");
      setSchritt("fertig");
    } catch (err) {
      setServerFehler(
        err instanceof Error ? err.message : "Die Anfrage konnte nicht gesendet werden.",
      );
    } finally {
      setSendet(false);
    }
  }

  /**
   * WhatsApp ist ein echter Link, kein Button mit window.open.
   *
   * Gründe: Long-Press und Mittelklick funktionieren, Screenreader kündigen
   * ihn als Link an, kein Popup-Blocker kann dazwischenfunken — und die
   * Nachricht steht als href im DOM, ist also überprüfbar.
   *
   * Bei ungültigen Angaben wird der Klick abgefangen; sonst gingen Anfragen
   * ohne Namen und Adresse raus, also genau das, was der zweite Schritt
   * verhindern soll.
   */
  function whatsappKlick(e: React.MouseEvent<HTMLAnchorElement>) {
    const gefunden = pruefen();
    setFehler(gefunden);
    if (Object.keys(gefunden).length > 0) {
      e.preventDefault();
      document.getElementById(`k-${slug}-${Object.keys(gefunden)[0]}`)?.focus();
      return;
    }
    // Nicht awaiten: Der Link soll ohne Verzögerung öffnen. Schlägt das
    // Speichern fehl, ist die Nachricht trotzdem bei Arian.
    void uebermitteln("whatsapp").catch(() => {});
    setSchritt("fertig");
  }

  /* ---------------------------------------------------------- Preisspalte */
  const preisSpalte = (
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
      <p className="mt-2 text-sm text-white/70">{result.unit} · inkl. 19 % MwSt.</p>

      {result.oneOffGross && (
        <p className="mt-4 rounded-sm border border-white/15 px-3 py-2.5 text-sm text-white/85">
          Zusätzlich einmalig ca.{" "}
          <span className="font-semibold text-gold-soft">{euro(result.oneOffGross)}</span>
          <span className="block text-xs text-white/55">{result.oneOffLabel}</span>
        </p>
      )}

      {schritt === "angaben" && (
        <div className="mt-5 border-t border-white/15 pt-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/50">
            Ihre Angaben
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/80">{result.summary}</p>
        </div>
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
            Unverbindliche Schätzung. Den Festpreis nennen wir nach der kostenlosen
            Besichtigung.
          </span>
        </li>
      </ul>
    </div>
  );

  /* ------------------------------------------------------------- Abschluss */
  if (schritt === "fertig") {
    return (
      <div
        className={cn(
          "rounded-sm border border-gold/40 bg-gold/8 p-8 text-center sm:p-12",
          className,
        )}
      >
        <CheckCircle2 className="mx-auto size-11 text-gold-deep" aria-hidden />
        <h3 className="mt-5 font-display text-2xl text-navy">
          Danke, {felder.name.split(" ")[0]} — Ihre Anfrage ist da.
        </h3>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-muted">
          Wir melden uns in der Regel noch am selben Werktag telefonisch und
          vereinbaren einen Termin am Objekt in {felder.ort}. Vor Ort sehen wir
          uns alles an und nennen Ihnen den verbindlichen Festpreis — kostenlos
          und ohne Verpflichtung.
        </p>
        <p className="mt-6 text-sm text-ink-muted">
          Wenn es eilt, erreichen Sie uns direkt unter{" "}
          <a href={business.phone.href} className="font-semibold text-navy underline">
            {business.phone.display}
          </a>
          .
        </p>
      </div>
    );
  }

  /* -------------------------------------------------------------- Schritte */
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-sm border border-mist bg-mist lg:grid-cols-[1.35fr_1fr]",
        className,
      )}
    >
      <div className="bg-surface p-6 sm:p-8">
        {schritt === "rechner" ? (
          <>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-xl text-navy">{spec.title}</h3>
              <span className="shrink-0 text-xs font-semibold text-ink-muted">
                Schritt 1 von 2
              </span>
            </div>
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
                      {/* Schieberegler zusätzlich zum Zahlenfeld: am Handy
                          schneller, am Desktop bleibt die exakte Eingabe. */}
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

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setSchritt("angaben")}
                className="inline-flex items-center gap-2 rounded-sm bg-navy px-6 py-3.5 font-display text-sm font-bold text-white transition-colors hover:bg-navy-band"
              >
                Unverbindlich anfragen
                <ArrowRight className="size-4" aria-hidden />
              </button>
              <a
                href={business.phone.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold-deep"
              >
                <Phone className="size-4" aria-hidden />
                Lieber anrufen
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-xl text-navy">Fast geschafft.</h3>
              <span className="shrink-0 text-xs font-semibold text-ink-muted">
                Schritt 2 von 2
              </span>
            </div>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              Wir brauchen nur noch Ihre Angaben. Dann melden wir uns für einen
              Termin bei Ihnen vor Ort und nennen Ihnen den verbindlichen
              Festpreis — kostenlos und ohne Verpflichtung.
            </p>

            <div className="mt-7 space-y-4">
              <div>
                <label htmlFor={`k-${slug}-name`} className="mb-1.5 block text-sm font-semibold text-navy">
                  Name <span className="text-gold-deep">*</span>
                </label>
                <input
                  id={`k-${slug}-name`}
                  autoComplete="name"
                  value={felder.name}
                  onChange={(e) => setFeld("name", e.target.value)}
                  aria-invalid={Boolean(fehler.name)}
                  className={FELD}
                />
                {fehler.name && <Err>{fehler.name}</Err>}
              </div>

              {/* Eigene Überschrift, weil der Einsatzort oft NICHT die
                  Wohnadresse ist: bei Entrümpelungen die Wohnung eines
                  Angehörigen, bei Objektbetreuung das verwaltete Haus. Ohne
                  den Hinweis tragen Leute reflexhaft ihre eigene ein. */}
              <div className="border-t border-mist pt-5">
                <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                  Wo soll gearbeitet werden?
                </p>
                <p className="mt-1.5 text-xs text-ink-muted">
                  Adresse des Objekts — muss nicht Ihre eigene Adresse sein.
                </p>
              </div>

              <div>
                <label htmlFor={`k-${slug}-strasse`} className="mb-1.5 block text-sm font-semibold text-navy">
                  Straße und Hausnummer <span className="text-gold-deep">*</span>
                </label>
                <input
                  id={`k-${slug}-strasse`}
                  autoComplete="street-address"
                  value={felder.strasse}
                  onChange={(e) => setFeld("strasse", e.target.value)}
                  aria-invalid={Boolean(fehler.strasse)}
                  className={FELD}
                />
                {fehler.strasse && <Err>{fehler.strasse}</Err>}
              </div>

              <div className="grid gap-4 sm:grid-cols-[7rem_1fr]">
                <div>
                  <label htmlFor={`k-${slug}-plz`} className="mb-1.5 block text-sm font-semibold text-navy">
                    PLZ <span className="text-gold-deep">*</span>
                  </label>
                  <input
                    id={`k-${slug}-plz`}
                    inputMode="numeric"
                    maxLength={5}
                    autoComplete="postal-code"
                    value={felder.plz}
                    onChange={(e) => setFeld("plz", e.target.value.replace(/\D/g, ""))}
                    aria-invalid={Boolean(fehler.plz)}
                    className={FELD}
                  />
                  {fehler.plz && <Err>{fehler.plz}</Err>}
                </div>
                <div>
                  <label htmlFor={`k-${slug}-ort`} className="mb-1.5 block text-sm font-semibold text-navy">
                    Ort <span className="text-gold-deep">*</span>
                  </label>
                  <input
                    id={`k-${slug}-ort`}
                    autoComplete="address-level2"
                    value={felder.ort}
                    onChange={(e) => setFeld("ort", e.target.value)}
                    aria-invalid={Boolean(fehler.ort)}
                    className={FELD}
                  />
                  {fehler.ort && <Err>{fehler.ort}</Err>}
                </div>
              </div>

              <div className="border-t border-mist pt-5">
                <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                  Wie erreichen wir Sie?
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`k-${slug}-phone`} className="mb-1.5 block text-sm font-semibold text-navy">
                    Telefon <span className="text-gold-deep">*</span>
                  </label>
                  <input
                    id={`k-${slug}-phone`}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={felder.phone}
                    onChange={(e) => setFeld("phone", e.target.value)}
                    aria-invalid={Boolean(fehler.phone)}
                    className={FELD}
                  />
                  {fehler.phone && <Err>{fehler.phone}</Err>}
                </div>
                <div>
                  <label htmlFor={`k-${slug}-email`} className="mb-1.5 block text-sm font-semibold text-navy">
                    E-Mail
                  </label>
                  <input
                    id={`k-${slug}-email`}
                    type="email"
                    autoComplete="email"
                    value={felder.email}
                    onChange={(e) => setFeld("email", e.target.value)}
                    aria-invalid={Boolean(fehler.email)}
                    className={FELD}
                  />
                  {fehler.email && <Err>{fehler.email}</Err>}
                </div>
              </div>

              <div>
                <label htmlFor={`k-${slug}-message`} className="mb-1.5 block text-sm font-semibold text-navy">
                  Noch etwas, das wir wissen sollten?
                </label>
                <textarea
                  id={`k-${slug}-message`}
                  rows={3}
                  value={felder.message}
                  onChange={(e) => setFeld("message", e.target.value)}
                  placeholder="Zum Beispiel Wunschtermin, Zugang zum Objekt oder Besonderheiten."
                  className={FELD}
                />
              </div>

              <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ink-muted">
                <input
                  id={`k-${slug}-consent`}
                  type="checkbox"
                  checked={felder.consent}
                  onChange={(e) => setFeld("consent", e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-gold"
                />
                <span>
                  Meine Angaben dürfen zur Bearbeitung der Anfrage gespeichert und
                  verarbeitet werden.{" "}
                  <a href="/datenschutz" className="underline hover:text-navy">
                    Datenschutz
                  </a>
                  . <span className="text-gold-deep">*</span>
                </span>
              </label>
              {fehler.consent && <Err>{fehler.consent}</Err>}

              {serverFehler && (
                <p className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {serverFehler} Bitte rufen Sie uns an:{" "}
                  <a href={business.phone.href} className="font-semibold underline">
                    {business.phone.display}
                  </a>
                </p>
              )}
            </div>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                disabled={sendet}
                onClick={absenden}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-navy px-6 py-3.5 font-display text-sm font-bold text-white transition-colors hover:bg-navy-band disabled:opacity-60"
              >
                {sendet ? "Wird gesendet …" : "Anfrage senden"}
                <ArrowRight className="size-4" aria-hidden />
              </button>
              <a
                href={whatsappLink(nachrichtDaten)}
                target="_blank"
                rel="noopener"
                onClick={whatsappKlick}
                data-whatsapp
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy/20 px-6 py-3.5 font-display text-sm font-bold text-navy transition-colors hover:border-gold hover:text-gold-deep"
              >
                <MessageCircle className="size-4" aria-hidden />
                Per WhatsApp senden
              </a>
            </div>

            <button
              type="button"
              onClick={() => setSchritt("rechner")}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-navy"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Angaben im Rechner ändern
            </button>

            <p className="mt-5 text-xs leading-relaxed text-ink-muted">
              Die Adresse des Objekts brauchen wir, um Anfahrt und Aufwand
              einzuschätzen — wir schicken Ihnen nichts zu und geben nichts weiter.
            </p>

            {/* Echte Vorschau statt Versprechen: Wer seine Adresse eintippt,
                darf sehen, was damit verschickt wird. Zugeklappt, damit sie
                niemanden erschlägt, der einfach nur senden will. */}
            {felder.name && felder.strasse && felder.plz && felder.ort && (
              <details className="group mt-3">
                <summary className="cursor-pointer list-none text-xs font-semibold text-navy underline decoration-mist underline-offset-4 hover:decoration-gold [&::-webkit-details-marker]:hidden">
                  Nachricht ansehen, die verschickt wird
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded-sm border border-mist bg-shell p-3.5 font-sans text-xs leading-relaxed whitespace-pre-wrap text-ink-muted">
                  {whatsappText(nachrichtDaten)}
                </pre>
              </details>
            )}
          </>
        )}
      </div>

      {preisSpalte}
    </div>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-sm text-red-700">
      {children}
    </p>
  );
}
