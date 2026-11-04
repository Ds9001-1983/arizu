import { expect, test } from "@playwright/test";

/* ==================================================================
   Fixe Aktionsleiste auf dem Handy und Menüpunkt „Preisrechner“
   (Wunsch von Dennis, 04.11.2026).

   Die dritte Aktion passt zur Seite. Geprüft wird vor allem, dass der
   Geschäftskundenbereich KEINEN Preis bewirbt — dort gibt es bewusst
   keinen öffentlichen Rechner (Kundengespräch 14.08.2026).
   ================================================================== */

const leiste = (page: import("@playwright/test").Page) =>
  page.locator("[data-sticky-bar]");

test("Header führt zum Preisrechner im Privatkundenbereich", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  // Auf dem Handy steckt die Navigation hinter dem Burger-Menü.
  if (testInfo.project.name === "mobil") {
    await page.getByRole("button", { name: "Menü öffnen" }).click();
  }
  await expect(
    page.locator("header").getByRole("link", { name: "Preisrechner" }),
  ).toHaveAttribute("href", "/privatkunden#richtpreis");
});

test("Aktionsleiste zeigt je Seite die passende dritte Aktion", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobil", "Die Leiste gibt es nur mobil.");

  const erwartet: [string, string, string][] = [
    ["/", "Preis schätzen", "/privatkunden#richtpreis"],
    ["/privatkunden", "Preis schätzen", "#richtpreis"],
    ["/leistungen/gebaeudereinigung", "Preis schätzen", "#rechner"],
    ["/leistungen/objektbetreuung", "Anfragen", "#anfrage"],
    ["/geschaeftskunden", "Bedarf schildern", "#bedarf"],
  ];

  for (const [pfad, label, href] of erwartet) {
    await page.goto(pfad);
    const bar = leiste(page);
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Anrufen" })).toBeVisible();
    await expect(bar.getByRole("link", { name: label })).toHaveAttribute("href", href);
  }

  await page.goto("/geschaeftskunden");
  await expect(leiste(page)).not.toContainText("Preis");
});

test("Aktionsleiste weicht beim Tippen der Tastatur", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobil", "Die Leiste gibt es nur mobil.");

  await page.goto("/privatkunden");
  const bar = leiste(page);
  await expect(bar).toBeInViewport();

  const feld = page.getByRole("tabpanel").getByLabel("Zu reinigende Fläche");
  await feld.focus();
  await expect(bar).not.toBeInViewport();

  await feld.blur();
  await expect(bar).toBeInViewport();
});

test("Aktionsleiste fehlt im internen Bereich", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobil", "Die Leiste gibt es nur mobil.");

  await page.goto("/intern/login");
  await expect(leiste(page)).toHaveCount(0);
});
