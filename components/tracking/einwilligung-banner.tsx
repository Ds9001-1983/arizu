"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import {
  einwilligungOeffnen,
  einwilligungSchliessen,
  einwilligungSpeichern,
  marketingErlaubtJetzt,
  useBannerZustand,
  type BannerZustand,
} from "@/lib/tracking/einwilligung-client";

/* ==================================================================
   Einwilligungsbanner (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO).

   Erste Ebene: „Alle akzeptieren“ und „Nur notwendige“ sind derselbe
   Knopf in derselben Größe und Farbe, Ablehnen ist so leicht wie
   Zustimmen. Daneben „Einstellungen“ für die Auswahl je Kategorie. Das
   Häkchen bei Marketing ist nie vorausgefüllt.

   Barrierefreiheit (WCAG 2.1 AA):
   - Der Banner steht im DOM vor dem Header. Wer mit der Tastatur kommt,
     landet zuerst hier, auch wenn er optisch unten sitzt.
   - Beim ersten Besuch wird der Fokus nicht verschoben (kein Sprung beim
     Laden). Beim Wechsel auf „Einstellungen“ und beim Wiederöffnen über den
     Fuß springt der Fokus auf die Überschrift. Escape schließt den wieder
     geöffneten Banner, und der Fokus geht zurück auf den Auslöser.
   - Navy auf Weiß (17,5 : 1) und Weiß auf Navy, Nebentext #4A5568 auf
     Weiß (7,5 : 1). Gold nur als Linie oben, nicht als Fläche.
   - Knöpfe mindestens 44 px hoch.
   ================================================================== */

const KNOPF =
  "inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-navy px-4 py-2.5 " +
  "font-display text-sm font-bold text-white transition-colors hover:bg-navy-band";

const UEBERSCHRIFT_ID = "einwilligung-titel";
const TEXT_ID = "einwilligung-text";

export function EinwilligungBanner() {
  const zustand = useBannerZustand();
  const pfad = usePathname();
  // Der interne Bereich misst nichts und braucht deshalb auch keinen Banner.
  if (zustand === "zu" || pfad.startsWith("/intern")) return null;
  // key: Beim Wiederöffnen beginnt die Ansicht frisch, mit dem aktuellen Stand.
  return <Banner key={zustand} zustand={zustand} />;
}

function Banner({ zustand }: { zustand: Exclude<BannerZustand, "zu"> }) {
  const erneut = zustand === "erneut";
  const [ansicht, setAnsicht] = useState<"start" | "einstellungen">(
    erneut ? "einstellungen" : "start",
  );
  const [marketing, setMarketing] = useState(() => erneut && marketingErlaubtJetzt());
  const ueberschrift = useRef<HTMLHeadingElement>(null);
  const einstellungen = ansicht === "einstellungen";

  useEffect(() => {
    if (einstellungen) ueberschrift.current?.focus();
  }, [einstellungen]);

  useEffect(() => {
    if (!erneut) return;
    function taste(event: KeyboardEvent) {
      if (event.key === "Escape") einwilligungSchliessen();
    }
    document.addEventListener("keydown", taste);
    return () => document.removeEventListener("keydown", taste);
  }, [erneut]);

  return (
    <section
      aria-labelledby={UEBERSCHRIFT_ID}
      aria-describedby={TEXT_ID}
      data-einwilligung
      className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto border-t-2 border-gold bg-white text-navy shadow-[0_-12px_40px_-16px_rgb(11_26_47/0.45)] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-xl sm:rounded-sm sm:border sm:border-t-2 sm:border-mist sm:border-t-gold"
    >
      <div className="relative p-5 sm:p-6">
        {erneut && (
          <button
            type="button"
            onClick={einwilligungSchliessen}
            className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-sm text-ink-muted hover:text-navy"
          >
            <X className="size-5" aria-hidden />
            <span className="sr-only">Schließen, ohne etwas zu ändern</span>
          </button>
        )}

        <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-deep">
          Datenschutz
        </p>
        <h2
          id={UEBERSCHRIFT_ID}
          ref={ueberschrift}
          tabIndex={-1}
          className="mt-2 pr-10 font-display text-lg leading-snug text-navy focus:outline-none sm:text-xl"
        >
          {einstellungen ? "Cookie-Einstellungen" : "Cookies und Werbemessung"}
        </h2>
        <p id={TEXT_ID} className="mt-2 text-sm leading-relaxed text-ink-muted">
          Mit Ihrer Einwilligung nutzen wir den Meta-Pixel und die Conversions API
          von Meta. So sehen wir, ob unsere Anzeigen auf Facebook und Instagram zu
          Anfragen führen, und können Anzeigen an passende Zielgruppen ausspielen.
          Dabei werden Cookies gesetzt und Nutzungsdaten an Meta übermittelt, auch
          in die USA. Ohne Einwilligung funktioniert die Website genauso. Ihre Wahl
          können Sie jederzeit unter „Cookie-Einstellungen“ am Seitenende ändern
          oder widerrufen. Mehr dazu in der{" "}
          <Link href="/datenschutz#cookies" className="font-semibold text-navy underline">
            Datenschutzerklärung
          </Link>
          .
        </p>

        {einstellungen && (
          <fieldset className="mt-4">
            <legend className="sr-only">Kategorien</legend>
            <div className="flex gap-3 border-t border-mist py-4">
              <input
                id="kategorie-notwendig"
                type="checkbox"
                checked
                disabled
                aria-describedby="kategorie-notwendig-text"
                className="mt-0.5 size-5 shrink-0 accent-navy"
              />
              <div>
                <label htmlFor="kategorie-notwendig" className="font-semibold text-navy">
                  Notwendig <span className="font-normal text-ink-muted">(immer aktiv)</span>
                </label>
                <p
                  id="kategorie-notwendig-text"
                  className="mt-1 text-sm leading-relaxed text-ink-muted"
                >
                  Speichert Ihre Auswahl zwölf Monate im Cookie „arizu_einwilligung“,
                  damit wir nicht bei jedem Aufruf neu fragen.
                </p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-mist py-4">
              <input
                id="kategorie-marketing"
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                aria-describedby="kategorie-marketing-text"
                className="mt-0.5 size-5 shrink-0 cursor-pointer accent-navy"
              />
              <div>
                <label
                  htmlFor="kategorie-marketing"
                  className="cursor-pointer font-semibold text-navy"
                >
                  Marketing
                </label>
                <p
                  id="kategorie-marketing-text"
                  className="mt-1 text-sm leading-relaxed text-ink-muted"
                >
                  Meta-Pixel und Conversions API der Meta Platforms Ireland Ltd.:
                  Messung von Seitenaufrufen, Aufrufen der Leistungsseiten, der Wahl
                  zwischen Privat- und Geschäftskundenbereich, Kontaktklicks und
                  Anfragen sowie Zielgruppen für Werbung auf Facebook und Instagram.
                  Cookies „_fbp“ und „_fbc“. Übermittlung in die USA möglich.
                </p>
              </div>
            </div>
          </fieldset>
        )}

        <div
          className={
            einstellungen
              ? "mt-2 grid gap-3 sm:grid-cols-3"
              : "mt-5 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2"
          }
        >
          {einstellungen && (
            <button
              type="button"
              className={KNOPF}
              onClick={() => einwilligungSpeichern(marketing)}
            >
              Auswahl speichern
            </button>
          )}
          {/* „Alle akzeptieren“ steht rechts (Wunsch Dennis, 06.11.2026).
              Gestaltung bleibt für beide Knöpfe identisch. */}
          <button type="button" className={KNOPF} onClick={() => einwilligungSpeichern(false)}>
            Nur notwendige
          </button>
          <button type="button" className={KNOPF} onClick={() => einwilligungSpeichern(true)}>
            Alle akzeptieren
          </button>
        </div>

        {!einstellungen && (
          <button
            type="button"
            onClick={() => setAnsicht("einstellungen")}
            className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4"
          >
            Einstellungen
          </button>
        )}
      </div>
    </section>
  );
}

/** Im Fuß jeder Seite: Auswahl ändern oder widerrufen. */
export function EinwilligungLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={einwilligungOeffnen} className={className}>
      Cookie-Einstellungen
    </button>
  );
}
