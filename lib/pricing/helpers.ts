import type { ConfiguratorSpec, Values } from "./types";

/** Startwerte aus der Spezifikation ziehen — UI und Tests nutzen dieselbe Quelle. */
export function defaultValues(spec: ConfiguratorSpec) {
  const values: Values = {};
  for (const field of spec.fields) values[field.id] = field.default;
  return values;
}

/**
 * Auswahl als lesbaren Text zusammenfassen.
 *
 * Dieser String wandert unverändert in Lead-Formular, WhatsApp-Nachricht,
 * Bestätigungsmail und Lead-Inbox. Arian soll die Anfrage lesen können, ohne
 * die Website daneben offen zu haben — deshalb ausgeschriebene Feldnamen
 * statt IDs.
 */
export function summarize(spec: ConfiguratorSpec, values: Values): string {
  const parts: string[] = [];

  for (const field of spec.fields) {
    const raw = values[field.id];
    if (field.kind === "number") {
      const value = typeof raw === "number" ? raw : Number(raw);
      if (!value) continue;
      parts.push(`${field.label}: ${value} ${field.unit}`);
    } else if (field.kind === "select") {
      const option = field.options.find((item) => item.id === raw);
      if (option) parts.push(`${field.label}: ${option.label}`);
    } else {
      const ids = Array.isArray(raw) ? raw : [];
      if (!ids.length) continue;
      const labels = ids
        .map((id) => field.options.find((item) => item.id === id)?.label)
        .filter(Boolean);
      parts.push(`${field.label}: ${labels.join(", ")}`);
    }
  }

  return parts.join(" · ");
}
