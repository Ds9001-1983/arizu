import { expect, test } from "@playwright/test";

/* ==================================================================
   Der Konfigurator ist das Alleinstellungsmerkmal des Projekts — er wird
   deshalb im Browser geprüft, nicht nur die Rechenlogik (das macht
   scripts/check-pricing.ts).

   Geprüft wird die Kette, an der es in der Praxis hängt:
   Eingabe -> Preis ändert sich -> Schritt 2 -> vollständige Anfrage,
   inklusive der WhatsApp-Nachricht, die Name und Adresse enthalten MUSS.
   Ohne die ist es keine Anfrage, sondern eine Preisauskunft an einen
   Unbekannten.
   ================================================================== */

const PREIS = /\d[\d.]*\s*€\s*–\s*\d[\d.]*\s*€/;

/* "Anfrage senden" steht auf der Leistungsseite zweimal: im Konfigurator und
   im allgemeinen Formular am Seitenende. Interaktionen mit dem Rechner werden
   deshalb auf dessen Abschnitt eingegrenzt, sonst greift Playwrights
   Strict Mode. */
const rechner = (page: import("@playwright/test").Page) => page.locator("#rechner");

/** Schritt 2 mit gültigen Angaben füllen. */
async function angabenAusfuellen(page: import("@playwright/test").Page, slug: string) {
  await page.locator(`#k-${slug}-name`).fill("Dennis Sasse");
  await page.locator(`#k-${slug}-strasse`).fill("Römerstraße 23");
  await page.locator(`#k-${slug}-plz`).fill("51674");
  await page.locator(`#k-${slug}-ort`).fill("Wiehl");
  await page.locator(`#k-${slug}-phone`).fill("0179 5272126");
  await page.locator(`#k-${slug}-consent`).check();
}

test("Startseite: Preis ändert sich bei Eingabe", async ({ page }) => {
  await page.goto("/");
  const panel = page.getByRole("tabpanel");
  await panel.scrollIntoViewIfNeeded();

  const preis = panel.locator("p[aria-live='polite']");
  await expect(preis).toHaveText(PREIS);
  const vorher = await preis.textContent();

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
  await expect(page.getByText(/Zusätzlich einmalig ca\./)).toBeVisible();
});

test("Anfragen führt zu Schritt 2, der Preis bleibt sichtbar", async ({ page }) => {
  await page.goto("/leistungen/entruempelung");
  await expect(page.getByText("Schritt 1 von 2")).toBeVisible();

  await page.getByRole("button", { name: "Unverbindlich anfragen" }).click();

  await expect(page.getByRole("heading", { name: "Fast geschafft." })).toBeVisible();
  await expect(page.getByText("Schritt 2 von 2")).toBeVisible();
  // Der Richtpreis muss stehen bleiben — sonst weiß der Kunde nicht mehr,
  // worauf er sich gerade einlässt.
  await expect(page.locator("p[aria-live='polite']")).toHaveText(PREIS);
  await expect(page.getByText("Ihre Angaben", { exact: true })).toBeVisible();
});

test("Schritt 2 verlangt Name, Adresse, Telefon und Einwilligung", async ({ page }) => {
  await page.goto("/leistungen/entruempelung");
  const k = rechner(page);
  await k.getByRole("button", { name: "Unverbindlich anfragen" }).click();
  await k.getByRole("button", { name: "Anfrage senden" }).click();

  await expect(k.getByText("Bitte geben Sie Ihren Namen an.")).toBeVisible();
  await expect(k.getByText("Bitte Straße und Hausnummer angeben.")).toBeVisible();
  await expect(k.getByText("Fünfstellige Postleitzahl.")).toBeVisible();
  await expect(k.getByText("Bitte den Ort angeben.")).toBeVisible();
  await expect(
    k.getByText(/Ohne Ihre Einwilligung dürfen wir die Anfrage nicht verarbeiten/),
  ).toBeVisible();
});

/* Die Nachricht wird aus dem href gelesen, NICHT aus der geöffneten Seite:
   wa.me leitet weiter, und dabei ändert sich die Kodierung der Emojis. Der
   href ist der Wert, den der Browser tatsächlich verschickt. */
async function whatsappNachricht(page: import("@playwright/test").Page) {
  const href = await rechner(page).locator("a[data-whatsapp]").getAttribute("href");
  return decodeURIComponent(new URL(href!).searchParams.get("text") ?? "");
}

test("WhatsApp-Nachricht enthält Name, Adresse und die Konfigurator-Daten", async ({
  page,
}) => {
  await page.goto("/leistungen/entruempelung");
  await rechner(page).getByRole("button", { name: "Unverbindlich anfragen" }).click();
  await angabenAusfuellen(page, "entruempelung");

  const text = await whatsappNachricht(page);

  // Struktur: Leistung mit Emoji, Eckdaten als Liste, Preis, Kontaktblock
  expect(text).toContain("📦 *Entrümpelung*");
  expect(text).toMatch(/^• Zu räumende Fläche: \d+ m²$/m);
  expect(text).toMatch(/💶 Ihr Rechner nennt \*ca\. .* € – .* €\*/);
  expect(text).toContain("*Meine Kontaktdaten*");
  expect(text).toContain("👤 Dennis Sasse");
  // Straße vor Ort — deutsche Lesereihenfolge
  expect(text).toContain("📍 Römerstraße 23, 51674 Wiehl");
  expect(text).toContain("📞 0179 5272126");
  expect(text).toContain("Bitte melden Sie sich für einen Termin vor Ort.");
});

test("Vorschau zeigt genau die Nachricht, die verschickt wird", async ({ page }) => {
  await page.goto("/leistungen/gartenpflege");
  await rechner(page).getByRole("button", { name: "Unverbindlich anfragen" }).click();
  await angabenAusfuellen(page, "gartenpflege");

  await page.getByText("Nachricht ansehen, die verschickt wird").click();
  const vorschau = (await rechner(page).locator("pre").innerText()).trim();
  expect(vorschau).toContain("🌿 *Gartenpflege*");

  // Die Vorschau darf kein Marketing sein, sondern muss der Nachricht
  // entsprechen — sonst ist sie schlimmer als keine.
  expect((await whatsappNachricht(page)).trim()).toBe(vorschau);
});

test("Kein wa.me — WhatsApp läuft über api.whatsapp.com", async ({ page }) => {
  /* wa.me antwortet mit einem 302 und kodiert die Nachricht dabei um: aus
     dem Emoji 📦 (%F0%9F%93%A6) wird %EF%BF%BD, beim Kunden steht ein
     Fragezeichen im Chat. Betroffen sind auch ✉ und ☎. Dieser Test hält den
     kurzen Link draußen, falls ihn jemand für hübscher hält. */
  for (const pfad of ["/", "/leistungen/entruempelung", "/kontakt"]) {
    await page.goto(pfad);
    const links = await page.locator('a[href*="whatsapp"], a[href*="wa.me"]').all();
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) {
      const href = (await l.getAttribute("href")) ?? "";
      expect(href, `wa.me auf ${pfad}`).not.toContain("wa.me");
      expect(href).toContain("api.whatsapp.com/send");
    }
  }
});

test("WhatsApp-Link ohne Angaben schickt nichts los", async ({ page }) => {
  await page.goto("/leistungen/entruempelung");
  await rechner(page).getByRole("button", { name: "Unverbindlich anfragen" }).click();
  // Ohne ausgefüllte Felder muss der Klick abgefangen werden, sonst ginge
  // eine Anfrage ohne Namen und Adresse raus.
  await rechner(page).locator("a[data-whatsapp]").click();
  await expect(rechner(page).getByText("Bitte geben Sie Ihren Namen an.")).toBeVisible();
  await expect(page).toHaveURL(/leistungen\/entruempelung/);
});

test("Abgeschickte Anfrage bestätigt mit Namen und Ort", async ({ page }) => {
  await page.goto("/leistungen/entruempelung");
  await rechner(page).getByRole("button", { name: "Unverbindlich anfragen" }).click();
  await angabenAusfuellen(page, "entruempelung");
  await rechner(page).getByRole("button", { name: "Anfrage senden" }).click();

  await expect(page.getByRole("heading", { name: /Danke, Dennis/ })).toBeVisible();
  await expect(page.getByText(/Termin bei Ihnen in Wiehl/)).toBeVisible();
});

test("Zurück zum Rechner behält die Eingaben", async ({ page }) => {
  await page.goto("/leistungen/entruempelung");
  const flaeche = page.getByLabel("Zu räumende Fläche");
  await flaeche.fill("175");
  await flaeche.blur();

  await page.getByRole("button", { name: "Unverbindlich anfragen" }).click();
  await page.getByRole("button", { name: "Angaben im Rechner ändern" }).click();

  await expect(page.getByLabel("Zu räumende Fläche")).toHaveValue("175");
});

test("Allgemeines Formular verlangt ebenfalls die Adresse", async ({ page }) => {
  // Die Kontaktseite hat keinen Konfigurator, "Anfrage senden" ist dort eindeutig.
  await page.goto("/kontakt");
  await page.getByRole("button", { name: "Anfrage senden" }).click();

  await expect(page.getByText("Bitte geben Sie Ihren Namen an.")).toBeVisible();
  await expect(page.getByText("Bitte Straße und Hausnummer angeben.")).toBeVisible();
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
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
