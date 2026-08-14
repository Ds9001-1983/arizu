"use client";

import { Copy } from "lucide-react";

/**
 * Kopiert den Einsatzort in die Rechnungsadresse.
 *
 * Klingt nach Spielerei, ist aber der häufigste Fall: Wer seine eigene
 * Wohnung reinigen oder seinen Keller räumen lässt, bekommt die Rechnung an
 * dieselbe Adresse. Ohne den Knopf tippt Arian sie jedes Mal ab — am Handy,
 * beim Kunden, zwischen Tür und Angel.
 *
 * Bewusst kein State, sondern direkter DOM-Zugriff auf die Felder desselben
 * Formulars: Die Seite ist eine Server-Komponente mit einer Server Action,
 * und dafür extra einen Client-State-Baum aufzuspannen wäre unverhältnismäßig.
 */
export function RgUebernehmen({ nameFallback }: { nameFallback: string }) {
  function uebernehmen() {
    const form = document.querySelector<HTMLFormElement>("form[data-lead-form]");
    if (!form) return;

    const lies = (n: string) =>
      (form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "";
    const schreib = (n: string, v: string) => {
      const el = form.elements.namedItem(n) as HTMLInputElement | null;
      if (el) el.value = v;
    };

    schreib("rg_name", lies("name") || nameFallback);
    schreib("rg_strasse", lies("strasse"));
    schreib("rg_plz", lies("plz"));
    schreib("rg_ort", lies("ort"));
  }

  return (
    <button
      type="button"
      onClick={uebernehmen}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-deep hover:text-navy"
    >
      <Copy className="size-3.5" aria-hidden />
      Einsatzort übernehmen
    </button>
  );
}
