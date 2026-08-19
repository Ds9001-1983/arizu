import type { ConfiguratorSpec } from "./types";
import { entruempelung } from "./entruempelung";
import { gartenpflege } from "./gartenpflege";
import { gebaeudereinigung } from "./gebaeudereinigung";

/* Nur diese Spezifikationen dürfen in den öffentlichen Client-Rechner. Die
   Objektbetreuung bleibt in der vollständigen Server-Registry für Arians
   interne Kalkulation erhalten, wird aber nicht mehr an Besucher ausgeliefert. */
const publicConfigurators = {
  gebaeudereinigung,
  gartenpflege,
  entruempelung,
} as const;

export type PublicConfiguratorSlug = keyof typeof publicConfigurators;

export function getPublicConfigurator(
  slug: string,
): ConfiguratorSpec | undefined {
  return (publicConfigurators as Record<string, ConfiguratorSpec>)[slug];
}
