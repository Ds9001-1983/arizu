import type { ConfiguratorSpec } from "./types";
import { entruempelung } from "./entruempelung";
import { gartenpflege } from "./gartenpflege";
import { gebaeudereinigung } from "./gebaeudereinigung";
import { objektbetreuung } from "./objektbetreuung";

/* Registry in der Reihenfolge des Designentwurfs. */
export const configurators = {
  objektbetreuung,
  gebaeudereinigung,
  gartenpflege,
  entruempelung,
} as const;

export type ConfiguratorSlug = keyof typeof configurators;

export function getConfigurator(slug: string): ConfiguratorSpec | undefined {
  return (configurators as Record<string, ConfiguratorSpec>)[slug];
}

/** Startwerte aus der Spezifikation ziehen — UI und Tests nutzen dieselbe Quelle. */
export function defaultValues(spec: ConfiguratorSpec) {
  const v: Record<string, string | number | string[]> = {};
  for (const f of spec.fields) v[f.id] = f.default;
  return v;
}

/**
 * Auswahl als lesbaren Text zusammenfassen.
 *
 * Dieser String wandert unverändert in Lead-Formular, WhatsApp-Nachricht,
 * Bestätigungsmail und Lead-Inbox. Arian soll die Anfrage lesen können, ohne
 * die Website daneben offen zu haben — deshalb ausgeschriebene Feldnamen
 * statt IDs.
 */
export function summarize(
  spec: ConfiguratorSpec,
  values: Record<string, string | number | string[]>,
): string {
  const parts: string[] = [];

  for (const f of spec.fields) {
    const raw = values[f.id];
    if (f.kind === "number") {
      const n = typeof raw === "number" ? raw : Number(raw);
      if (!n) continue; // 0 m² Hecke ist keine Information
      parts.push(`${f.label}: ${n} ${f.unit}`);
    } else if (f.kind === "select") {
      const opt = f.options.find((o) => o.id === raw);
      if (opt) parts.push(`${f.label}: ${opt.label}`);
    } else {
      const ids = Array.isArray(raw) ? raw : [];
      if (!ids.length) continue;
      const labels = ids
        .map((id) => f.options.find((o) => o.id === id)?.label)
        .filter(Boolean);
      parts.push(`${f.label}: ${labels.join(", ")}`);
    }
  }

  return parts.join(" · ");
}

export * from "./types";
