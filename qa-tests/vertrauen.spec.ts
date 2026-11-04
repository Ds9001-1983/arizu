import { expect, test } from "@playwright/test";

/* ==================================================================
   Mitgliedschaften und Einsatzorte (Wünsche von Arian, 04.11.2026).

   Beides steht nur in lib/business.ts. Geprüft wird, dass es sichtbar
   auf der Seite ankommt und dass Google dieselben Angaben im JSON-LD
   bekommt.
   ================================================================== */

async function firma(page: import("@playwright/test").Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((b) => JSON.parse(b)).find((d) => d.memberOf);
}

test("Startseite und Geschäftskunden zeigen beide Mitgliedschaften", async ({ page }) => {
  for (const pfad of ["/", "/geschaeftskunden"]) {
    await page.goto(pfad);
    const block = page.getByRole("region", { name: "Eingetragen und versichert" });
    await expect(block).toContainText("Mitglied der Handwerkskammer Lübeck");
    await expect(block).toContainText("Mitglied der BG BAU");
  }
  const daten = await firma(page);
  expect(daten.memberOf.map((m: { name: string }) => m.name)).toEqual([
    "Handwerkskammer Lübeck",
    "BG BAU – Berufsgenossenschaft der Bauwirtschaft",
  ]);
});

test("Einsatzgebiet nennt Umland und Hamburger Stadtteile getrennt", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Elmshorn und Umland" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hamburg", exact: true })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: /^Schnelsen$/ })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: /^Itzehoe$/ })).toBeVisible();

  const daten = await firma(page);
  const orte = daten.areaServed.map((a: { name: string }) => a.name);
  expect(orte).toContain("Norderstedt");
  expect(orte).toContain("Hamburg-Blankenese");
});
