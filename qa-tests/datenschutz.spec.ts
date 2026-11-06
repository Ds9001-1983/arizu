import { expect, test } from "@playwright/test";
import { PREISRECHNER_AKTIV } from "../lib/features";
import { EINWILLIGUNG_COOKIE, leseEinwilligung } from "../lib/tracking/einwilligung";

/* ==================================================================
   Die Datenschutzerklärung macht zwei nachprüfbare Zusagen:

     "Solange Sie keine Auswahl getroffen haben, setzt diese Website keine
      Cookies, legt nichts im lokalen Speicher oder im Sitzungsspeicher
      Ihres Browsers ab und lädt nichts von fremden Servern."

     "Ohne Ihre Einwilligung wird beim Aufruf dieser Website kein fremder
      Server kontaktiert."

   Seit 06.11.2026 gibt es einen Einwilligungsbanner für den Meta-Pixel.
   Die Zusagen gelten deshalb für zwei Zustände: ohne Entscheidung (leerer
   Browser) und nach „Nur notwendige“ (Voreinstellung aller Tests, siehe
   playwright.config.ts). Beides ist hier festgeschrieben — nicht aus
   Ordnungsliebe, sondern weil eine eingebundene Google-Schrift, eine Karte
   oder ein Pixel, der zu früh lädt, die Aussage still falsch machen würde.
   Dann stünde eine unzutreffende Behauptung in einem Rechtstext.

   Schlägt einer dieser Tests fehl, ist nicht der Test das Problem: Dann
   lädt etwas ohne Einwilligung, und das muss raus oder hinter den Banner.
   Was nach „Alle akzeptieren“ passiert, prüft einwilligung.spec.ts.
   ================================================================== */

const SEITEN = [
  "/",
  "/leistungen/entruempelung",
  "/leistungen/gebaeudereinigung",
  "/geschaeftskunden",
  "/kontakt",
  "/datenschutz",
  "/impressum",
];

async function fremdeHosts(page: import("@playwright/test").Page, baseURL: string) {
  const eigen = new URL(baseURL).host;
  const fremde = new Set<string>();

  page.on("request", (r) => {
    const host = new URL(r.url()).host;
    // data:- und blob:-URLs haben keinen Host und sind unkritisch.
    if (host && host !== eigen) fremde.add(host);
  });

  for (const pfad of SEITEN) {
    await page.goto(pfad, { waitUntil: "networkidle" });
  }
  return [...fremde];
}

test.describe("ohne Entscheidung im Banner", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("kein fremder Host wird kontaktiert", async ({ page, baseURL }) => {
    expect(
      await fremdeHosts(page, baseURL!),
      "Die Datenschutzerklärung sagt zu, dass ohne Einwilligung kein fremder Server kontaktiert wird.",
    ).toEqual([]);
  });

  test("kein Cookie und kein Browserspeicher", async ({ page, context }) => {
    for (const pfad of SEITEN) {
      await page.goto(pfad, { waitUntil: "networkidle" });
    }

    // Den Konfigurator bzw. ohne Rechner das Formular der Leistungsseite
    // bedienen — auch dabei darf nichts abgelegt werden.
    await page.goto("/leistungen/entruempelung");
    if (PREISRECHNER_AKTIV) {
      await page
        .locator("#rechner")
        .getByRole("button", { name: "Unverbindliche Anfrage stellen" })
        .dispatchEvent("click");
    } else {
      const form = page.locator("#anfrage form");
      await form.getByLabel(/^Name/).fill("Alex Muster");
      // requestSubmit statt Klick: Der offene Banner liegt auf dem Handy über
      // dem Knopf, und genau dieser Zustand (keine Entscheidung) wird geprüft.
      await form.evaluate((f) => (f as HTMLFormElement).requestSubmit());
    }

    const cookies = await context.cookies();
    expect(
      cookies.map((c) => c.name),
      "Vor einer Entscheidung im Banner darf kein Cookie entstehen.",
    ).toEqual([]);

    const speicher = await page.evaluate(() => ({
      lokal: Object.keys(localStorage),
      sitzung: Object.keys(sessionStorage),
    }));
    expect(speicher.lokal).toEqual([]);
    expect(speicher.sitzung).toEqual([]);
  });
});

test.describe("nach „Nur notwendige“", () => {
  test("kein fremder Host wird kontaktiert", async ({ page, baseURL }) => {
    expect(await fremdeHosts(page, baseURL!)).toEqual([]);
  });

  test("nur das Einwilligungs-Cookie, ohne Marketing", async ({ page, context }) => {
    for (const pfad of SEITEN) {
      await page.goto(pfad, { waitUntil: "networkidle" });
    }
    const cookies = await context.cookies();
    expect(cookies.map((c) => c.name)).toEqual([EINWILLIGUNG_COOKIE]);
    expect(leseEinwilligung(cookies[0].value)?.marketing).toBe(false);
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  });
});

test("Datenschutzerklärung nennt die Speicherdauer und hat keine offenen Stellen", async ({
  page,
}) => {
  await page.goto("/datenschutz");
  const text = await page.locator("body").innerText();

  // Konkrete Frist statt Platzhalter.
  expect(text).toContain("24 Monate nach dem letzten Kontakt");
  expect(text).toContain("§ 257 HGB");
  expect(text).toContain("§ 147 AO");

  // Die roten Marker aus der Prototypphase dürfen hier nicht mehr stehen.
  expect(text).not.toContain("[ergänzen:");

  // Pflichtangaben, die am 06.11.2026 dazukamen: abgesetzter Hinweis auf das
  // Widerspruchsrecht (Art. 21 Abs. 4 DSGVO) und die Speicherdauer der Logs.
  expect(text).toContain("Ihr Widerspruchsrecht nach Art. 21 DSGVO");
  expect(text).toContain("einen Tag lang einsehen");
  // Meta-Cookies: gemessene Laufzeit, Widerruf auf jeder Seite.
  expect(text).toContain("nach 90 Tagen ab");
  expect(text).toContain("Cookie-Einstellungen");
});
