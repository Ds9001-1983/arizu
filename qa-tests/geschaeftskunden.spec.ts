import { expect, test } from "@playwright/test";

/* ==================================================================
   Trennung Privat- und Geschäftskunden (Kundengespräch 14.08.2026).

   Geprüft wird das, was Arian ausdrücklich verlangt hat: eine minimalistische
   Startseite, getrennte Privat-/Geschäftskundenwege, ein Geschäftskundenbereich
   OHNE Richtpreis und ein Formular mit den wesentlichen Pflichtangaben.
   ================================================================== */

test("Startseite ist minimal, der Rechner liegt im Privatkundenbereich", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(page.locator("#richtpreis")).toHaveCount(0);

  await page.goto("/privatkunden");
  await expect(page.getByRole("tablist")).toHaveCount(1);
  await expect(page.locator("#richtpreis")).toBeVisible();
});

test("Weiche führt in den Geschäftskundenbereich", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Zum Geschäftskundenbereich/ }).click();
  await expect(page).toHaveURL(/\/geschaeftskunden$/);
  await expect(
    page.getByRole("heading", { name: /Gebäudedienstleistungen für Unternehmen/ }),
  ).toBeVisible();
});

test("Weiche führt in den Privatkundenbereich", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Zum Privatkundenbereich/ }).click();
  await expect(page).toHaveURL(/\/privatkunden$/);
  await expect(page.getByRole("tablist")).toBeVisible();
});

test("Hero enthält nur das vereinbarte Leistungsversprechen", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("main > section").first();
  await expect(hero.getByRole("heading", { name: /Alles aus einer Hand/ })).toBeVisible();
  await expect(hero.getByText("Zuverlässig. Sauber. Professionell.")).toHaveCount(0);
  await expect(hero.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(hero.getByText(/Preis online sehen/)).toHaveCount(0);
});

test("Festnetz ist Primärnummer und Arian im Kontakt sichtbar", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('header a[href="tel:+494121420688"]')).toBeAttached();
  await expect(page.locator("body")).not.toContainText("0179 52 72 126");

  await page.goto("/kontakt");
  await expect(
    page.getByRole("img", { name: /Arian Aslani, Inhaber/ }),
  ).toBeVisible();
  await expect(page.locator("main").getByText("04121 42 06 88").first()).toBeVisible();
});

test("Geschäftskundenbereich nennt keinen Richtpreis", async ({ page }) => {
  await page.goto("/geschaeftskunden");
  // Der Preisträger des Konfigurators darf hier nicht vorkommen …
  await expect(page.locator("p[aria-live='polite']")).toHaveCount(0);
  // … und auch sonst keine Preisspanne im Text.
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/\d[\d.]*\s*€\s*–\s*\d[\d.]*\s*€/);
});

test("Bedarfsformular verlangt Firma, Ansprechpartner, Kontakt und Bereich", async ({
  page,
}) => {
  await page.goto("/geschaeftskunden");
  await page.getByRole("button", { name: "Bedarf übermitteln" }).click();

  const meldungen = await page.locator("p[role=alert]").allInnerTexts();
  expect(meldungen.join(" ")).toContain("Bitte wählen Sie einen Bereich.");
  expect(meldungen.join(" ")).toContain("Bitte den Namen des Unternehmens angeben.");
  // Anders als im Privatbereich Pflicht — ein Angebot über mehrere Objekte
  // geht schriftlich raus.
  expect(meldungen.join(" ")).toContain("E-Mail-Adresse");
  // Eines von beiden genügt, aber nicht keines.
  expect(meldungen.join(" ")).toContain("Einheiten oder Fläche");
});

test("WhatsApp-Nachricht trägt die Bedarfsangaben und keinen Preis", async ({ page }) => {
  await page.goto("/geschaeftskunden");
  await page.getByRole("radio", { name: "Gebäudereinigung", exact: true }).first().check();
  await page.selectOption("#b2b-objektart", "wohnanlage");
  await page.fill("#b2b-objekte", "3");
  await page.fill("#b2b-groesse", "24");
  await page.selectOption("#b2b-rhythmus", "woechentlich");
  await page.fill("#b2b-unternehmen", "Musterverwaltung GmbH");
  await page.fill("#b2b-name", "Alex Muster");
  await page.fill("#b2b-phone", "0179 5272126");
  await page.fill("#b2b-email", "muster@example.invalid");
  await page.fill("#b2b-strasse", "Kaistraße 7");
  await page.fill("#b2b-plz", "25348");
  await page.fill("#b2b-ort", "Glückstadt");

  const href = await page.locator("a[data-whatsapp]").getAttribute("href");
  expect(href).toContain("api.whatsapp.com"); // nie wa.me, sonst zerfallen Umlaute
  const text = decodeURIComponent(new URL(href!).searchParams.get("text") ?? "");
  expect(text).toContain("Firma: Musterverwaltung GmbH");
  expect(text).toContain("Objekte: 3");
  expect(text).toContain("Einheiten: 24");
  expect(text).not.toContain("💶"); // kein Preisblock im Geschäftskundenweg
});

test("Geschäftskunden stehen in Navigation, Sitemap und llms.txt", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(
    page.locator("footer").getByRole("link", { name: "Für Geschäftskunden" }),
  ).toBeAttached();

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/privatkunden");
  expect(sitemap).toContain("/geschaeftskunden");

  const llms = await (await request.get("/llms.txt")).text();
  expect(llms).toContain("## Geschäftskunden");
});

test("Büro- und Praxisreinigung ist aus dem Privatrechner verschwunden", async ({
  page,
}) => {
  await page.goto("/leistungen/gebaeudereinigung");
  const rechner = page.locator("#rechner");
  await expect(rechner.getByText("Büro- oder Praxisreinigung")).toHaveCount(0);
  // Die privaten Fälle bleiben.
  await expect(rechner.getByText("Grundreinigung")).toBeVisible();
  await expect(rechner.getByText("Treppenhausreinigung")).toBeVisible();
  // Und der Weg dorthin ist beschrieben.
  await expect(
    rechner.getByText("Büro- und Praxisreinigung finden Sie im Geschäftskundenbereich."),
  ).toBeVisible();
});

test("jede Leistungsseite verweist auf den Geschäftskundenbereich", async ({ page }) => {
  for (const slug of [
    "objektbetreuung",
    "gebaeudereinigung",
    "gartenpflege",
    "entruempelung",
  ]) {
    await page.goto(`/leistungen/${slug}`);
    await expect(
      page.getByRole("link", { name: "Zum Geschäftskundenbereich" }),
    ).toBeVisible();
  }
});
