import { expect, test } from "@playwright/test";
import { PREISRECHNER_AKTIV } from "../lib/features";

/* ==================================================================
   Preisrechner ausgeschaltet (Arian, 05.11.2026: erst einmal nur Anfragen).

   Geprüft wird zweierlei:
   1. Nirgends steht mehr ein Rechner oder ein Preisversprechen.
   2. Überall, wo vorher der Rechner war, führt ein Weg zur Anfrage.

   Ist der Schalter in lib/features.ts wieder an, übernehmen die Tests in
   konfigurator.spec.ts, und diese Datei wird übersprungen.
   ================================================================== */

test.skip(PREISRECHNER_AKTIV, "Nur solange der Preisrechner ausgeschaltet ist.");

const PREISSPANNE = /\d[\d.]*\s*€\s*–\s*\d[\d.]*\s*€/;
const PREISVERSPRECHEN = /Preisschätzung|Preisrahmen|Preis online|Preis schätzen|Preiseinschätzung/;

const RECHNER_LEISTUNGEN = ["gebaeudereinigung", "gartenpflege", "entruempelung"];

for (const slug of RECHNER_LEISTUNGEN) {
  test(`/leistungen/${slug} zeigt das Anfrageformular statt des Rechners`, async ({
    page,
  }) => {
    await page.goto(`/leistungen/${slug}`);
    const main = page.locator("main");

    await expect(page.locator("#rechner")).toHaveCount(0);
    expect(await main.innerText()).not.toMatch(PREISVERSPRECHEN);
    expect(await main.innerText()).not.toMatch(PREISSPANNE);

    await expect(
      main.getByRole("link", { name: "Unverbindlich anfragen" }),
    ).toHaveAttribute("href", "#anfrage");

    // Genau ein Formular, mit der Leistung vorausgewählt — vorher stand am
    // Seitenende ein zweites hinter dem Rechner.
    await expect(page.locator("#anfrage")).toHaveCount(1);
    await expect(page.locator("#anfrage form")).toBeVisible();
    await expect(page.locator("#anfrage select[name='service']")).toHaveValue(slug);
  });
}

test("Privatkundenseite zeigt ein eigenes Anfrageformular", async ({ page }) => {
  await page.goto("/privatkunden");
  const main = page.locator("main");

  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(page.locator("#richtpreis")).toHaveCount(0);
  expect(await main.innerText()).not.toMatch(PREISVERSPRECHEN);
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute(
    "content",
    /schätzen/,
  );

  // Dennis, 06.11.2026: Ohne Rechner endet der Weg auf der Seite selbst.
  // Die Seite richtet sich an Privatkunden, also keine Auswahl privat/geschäftlich.
  await main.getByRole("link", { name: "Jetzt anfragen" }).click();
  await expect(page).toHaveURL(/\/privatkunden#anfrage$/);
  await expect(page.locator("#anfrage")).toHaveCount(1);
  await expect(page.locator("#anfrage form")).toBeVisible();
  await expect(page.locator("#anfrage input[name='kundenart']")).toHaveCount(0);

  // Der Kontaktweg für Telefon und WhatsApp bleibt.
  await expect(
    page.getByRole("link", { name: "Zum Kontakt", exact: true }),
  ).toHaveAttribute("href", "/kontakt");
});

test("Startseite und Weiche werben nicht mehr mit einer Preisschätzung", async ({
  page,
}) => {
  await page.goto("/");
  expect(await page.locator("main").innerText()).not.toMatch(PREISVERSPRECHEN);
  await expect(page.getByText("Rückmeldung in der Regel am selben Werktag")).toBeVisible();
});

test("Geschäftskundenseite verweist Privatkunden ohne Preisschätzung", async ({ page }) => {
  await page.goto("/geschaeftskunden");
  await expect(
    page.getByRole("link", { name: "Zum Privatkundenbereich", exact: true }),
  ).toHaveAttribute("href", "/privatkunden");
  await expect(page.locator('a[href="/privatkunden#richtpreis"]')).toHaveCount(0);
});

test("Header bietet keinen Preisrechner mehr an", async ({ page }, testInfo) => {
  for (const pfad of ["/", "/privatkunden", "/leistungen/entruempelung"]) {
    await page.goto(pfad);
    if (testInfo.project.name === "mobil") {
      await page.getByRole("button", { name: "Menü öffnen" }).click();
    }
    await expect(page.locator('a[href*="richtpreis"]')).toHaveCount(0);
  }
});

test("Rechtstexte erwähnen keinen Preisrechner", async ({ page }) => {
  for (const pfad of ["/datenschutz", "/agb", "/impressum"]) {
    await page.goto(pfad);
    expect(await page.locator("main").innerText(), pfad).not.toContain("Preisrechner");
  }

  // Abschnitt 4 fällt weg, die Nummern bleiben lückenlos.
  await page.goto("/datenschutz");
  const nummern = (await page.locator("main h2").allInnerTexts())
    .map((t) => t.match(/^(\d+)\./)?.[1])
    .filter(Boolean)
    .map(Number);
  expect(nummern).toEqual(nummern.map((_, i) => i + 1));
  // Seit 06.11.2026 mit Einwilligung, Meta-Pixel und Social-Profilen: 12.
  expect(nummern).toHaveLength(12);
  await expect(page.locator("main h2", { hasText: "Anfrageformular" })).toHaveText(
    "4. Anfrageformular",
  );
});

test("llms.txt verspricht keine Online-Preisschätzung", async ({ request }) => {
  const text = await (await request.get("/llms.txt")).text();
  expect(text).not.toContain("Details und Preisschätzung");
  expect(text).not.toContain("unverbindliche Preisschätzung");
  expect(text).toContain("Eine Online-Preisschätzung gibt es derzeit nicht.");
});
