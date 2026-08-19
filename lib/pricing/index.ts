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

export * from "./helpers";
export * from "./types";
export * from "./rates";
