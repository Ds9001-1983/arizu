import { expect, test } from "@playwright/test";
import { PREISRECHNER_AKTIV } from "../lib/features";

/* ==================================================================
   Fixe Aktionsleiste auf dem Handy und Menüpunkt „Preisrechner“
   (Wunsch von Dennis, 04.11.2026).

   Die dritte Aktion passt zur Seite. Geprüft wird vor allem, dass der
   Geschäftskundenbereich KEINEN Preis bewirbt — dort gibt es bewusst
   keinen öffentlichen Rechner (Kundengespräch 14.08.2026).

   Solange der Preisrechner aus ist (lib/features.ts, Arian 05.11.2026),
   fehlt der Menüpunkt, und die Leiste wirbt nirgends mit einem Preis.
   ================================================================== */

const leiste = (page: import("@playwright/test").Page) =>
  page.locator("[data-sticky-bar]");

test("Header führt nur bei eingeschaltetem Rechner zum Preisrechner", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  // Auf dem Handy steckt die Navigation hinter dem Burger-Menü.
  if (testInfo.project.name === "mobil") {
    await page.getByRole("button", { name: "Menü öffnen" }).click();
  }
  const punkt = page.locator("header").getByRole("link", { name: "Preisrechner" });
  if (PREISRECHNER_AKTIV) {
    await expect(punkt).toHaveAttribute("href", "/privatkunden#richtpreis");
  } else {
    await expect(punkt).toHaveCount(0);
    await expect(
      page.locator("header").getByRole("link", { name: "Kontakt", exact: true }),
    ).toBeVisible();
  }
});

test("Aktionsleiste zeigt je Seite die passende dritte Aktion", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobil", "Die Leiste gibt es nur mobil.");

  const erwartet: [string, string, string][] = PREISRECHNER_AKTIV
    ? [
        ["/", "Preis schätzen", "/privatkunden#richtpreis"],
        ["/privatkunden", "Preis schätzen", "#richtpreis"],
        ["/leistungen/gebaeudereinigung", "Preis schätzen", "#rechner"],
        ["/leistungen/objektbetreuung", "Anfragen", "#anfrage"],
        ["/geschaeftskunden", "Bedarf schildern", "#bedarf"],
      ]
    : [
        ["/", "Anfragen", "/kontakt#anfrage"],
        ["/privatkunden", "Anfragen", "#anfrage"],
        ["/leistungen/gebaeudereinigung", "Anfragen", "#anfrage"],
        ["/leistungen/entruempelung", "Anfragen", "#anfrage"],
        ["/leistungen/objektbetreuung", "Anfragen", "#anfrage"],
        ["/kontakt", "Anfragen", "/kontakt#anfrage"],
        ["/geschaeftskunden", "Bedarf schildern", "#bedarf"],
      ];

  for (const [pfad, label, href] of erwartet) {
    await page.goto(pfad);
    const bar = leiste(page);
    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Anrufen" })).toBeVisible();
    await expect(bar.getByRole("link", { name: label })).toHaveAttribute("href", href);
    if (!PREISRECHNER_AKTIV) await expect(bar).not.toContainText("Preis");
  }

  await page.goto("/geschaeftskunden");
  await expect(leiste(page)).not.toContainText("Preis");
});

test("Aktionsleiste weicht beim Tippen der Tastatur", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobil", "Die Leiste gibt es nur mobil.");

  // Mit Rechner dessen erstes Feld, ohne Rechner das zentrale Formular.
  await page.goto(PREISRECHNER_AKTIV ? "/privatkunden" : "/kontakt");
  const bar = leiste(page);
  await expect(bar).toBeInViewport();

  const feld = PREISRECHNER_AKTIV
    ? page.getByRole("tabpanel").getByLabel("Zu reinigende Fläche")
    : page.locator("#anfrage form").getByLabel(/^Name/);
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
