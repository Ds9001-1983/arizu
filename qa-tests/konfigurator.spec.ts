import { expect, test } from "@playwright/test";

/* ==================================================================
   Der Konfigurator ist das Alleinstellungsmerkmal des Projekts — er wird
   deshalb im Browser geprüft, nicht nur die Rechenlogik (das macht
   scripts/check-pricing.ts).

   Geprüft wird die Kette, an der es in der Praxis hängt:
   Eingabe -> Preis ändert sich -> Übergabe ins Formular -> WhatsApp-Link.
   ================================================================== */

const PREIS = /\d[\d.]*\s*€\s*–\s*\d[\d.]*\s*€/;

test("Startseite: Preis ändert sich bei Eingabe", async ({ page }) => {
  await page.goto("/");
  const panel = page.getByRole("tabpanel");
  await panel.scrollIntoViewIfNeeded();

  const preis = panel.locator("p[aria-live='polite']");
  await expect(preis).toHaveText(PREIS);
  const vorher = await preis.textContent();

  // Fläche verdoppeln — der Preis MUSS steigen.
  const flaeche = panel.getByLabel("Zu räumende Fläche");
  await flaeche.fill("120");
  await flaeche.blur();

  await expect(preis).not.toHaveText(vorher!);
  const zahl = (t: string) => Number(t.replace(/[^\d]/g, "").slice(0, 6));
  expect(zahl((await preis.textContent())!)).toBeGreaterThan(zahl(vorher!));
});

test("Leistung wechseln lädt den passenden Rechner", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Gartenpflege" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Gartenpflege berechnen");
  await expect(page.getByLabel("Rasenfläche")).toBeVisible();
});

test("Gartenpflege weist Einmalposten getrennt aus", async ({ page }) => {
  await page.goto("/leistungen/gartenpflege");
  const hecke = page.getByLabel("Heckenschnitt");
  await hecke.scrollIntoViewIfNeeded();
  await hecke.fill("50");
  await hecke.blur();

  // Heckenschnitt fällt 1–2× im Jahr an und darf nicht im Monatspreis stecken.
  await expect(page.getByText(/Zusätzlich einmalig ca\./)).toBeVisible();
});

test("Anfrage-Übergabe füllt das Formular", async ({ page }) => {
  await page.goto("/leistungen/entruempelung");
  await page.getByRole("button", { name: "Unverbindlich anfragen" }).click();

  const feld = page.getByLabel("Ihre Angaben aus dem Konfigurator");
  await expect(feld).not.toHaveValue("");
  await expect(feld).toHaveValue(/Richtpreis ca\./);
  await expect(feld).toHaveValue(/inkl\. MwSt\./);
});

test("Formular verlangt Name, Telefon und Einwilligung", async ({ page }) => {
  await page.goto("/kontakt");
  await page.getByRole("button", { name: "Anfrage senden" }).click();

  await expect(page.getByText("Bitte geben Sie Ihren Namen an.")).toBeVisible();
  await expect(
    page.getByText(/Ohne Ihre Einwilligung dürfen wir die Anfrage nicht verarbeiten/),
  ).toBeVisible();
});

test("interner Bereich ist ohne Anmeldung gesperrt", async ({ page }) => {
  await page.goto("/intern");
  await expect(page).toHaveURL(/\/intern\/login/);
  await expect(page.getByLabel("Passwort")).toBeVisible();
});

test("interner Bereich steht nicht in der Sitemap und ist auf noindex", async ({
  page,
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("/intern");

  await page.goto("/intern/login");
  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /noindex/);
});
