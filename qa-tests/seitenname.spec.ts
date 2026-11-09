import { expect, test } from "@playwright/test";

/* ==================================================================
   Seitenname in der Google-Suche (09.11.2026).

   Ohne WebSite-Strukturdaten zeigte Google über dem Treffer die Domain
   „arizu-gebaeudedienstleistungen.de“ statt „ARIZU“. Google liest den
   Seitennamen aus einem WebSite-Block auf der Startseite, und zwar nur
   dort: https://developers.google.com/search/docs/appearance/site-names
   ================================================================== */

type Block = Record<string, unknown>;

async function bloecke(page: import("@playwright/test").Page): Promise<Block[]> {
  const texte = await page.locator('script[type="application/ld+json"]').allTextContents();
  return texte.map((t) => JSON.parse(t));
}

const istWebsite = (b: Block) => b["@type"] === "WebSite";

test("Startseite nennt Google den Seitennamen ARIZU", async ({ page }) => {
  await page.goto("/");
  const alle = await bloecke(page);
  const websites = alle.filter(istWebsite);
  expect(websites).toHaveLength(1);

  const [website] = websites;
  expect(website.name).toBe("ARIZU");
  expect(website.alternateName).toEqual([
    "ARIZU Gebäudedienstleistungen",
    "arizu-gebaeudedienstleistungen.de",
  ]);
  // Google verlangt die Startseite der Domain, mit Schrägstrich.
  expect(website.url).toBe("https://www.arizu-gebaeudedienstleistungen.de/");

  // Der Verweis auf die Firma muss auf derselben Seite auflösen.
  const firmaId = (website.publisher as { "@id": string })["@id"];
  expect(alle.some((b) => b["@id"] === firmaId)).toBe(true);
});

test("Unterseiten tragen keinen WebSite-Block", async ({ page }) => {
  for (const pfad of ["/kontakt", "/geschaeftskunden", "/leistungen/gebaeudereinigung"]) {
    await page.goto(pfad);
    expect((await bloecke(page)).filter(istWebsite), pfad).toHaveLength(0);
  }
});
