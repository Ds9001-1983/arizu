import { expect, test } from "@playwright/test";

/* ==================================================================
   Die Datenschutzerklärung macht zwei nachprüfbare Zusagen:

     "Diese Website setzt beim Besuch keine Cookies und legt weder im
      lokalen Speicher noch im Sitzungsspeicher Ihres Browsers etwas ab."

     "Beim Aufruf dieser Website wird kein einziger fremder Server
      kontaktiert."

   Daran hängt, dass die Seite ohne Cookie-Banner auskommt (§ 25 TDDDG
   verlangt eine Einwilligung nur, wenn auf dem Endgerät gespeichert oder
   ausgelesen wird). Beides ist hier als Test festgeschrieben — nicht aus
   Ordnungsliebe, sondern weil eine eingebundene Google-Schrift, eine Karte
   oder eine Reichweitenmessung die Aussage still falsch machen würde. Dann
   stünde eine unzutreffende Behauptung in einem Rechtstext.

   Schlägt einer dieser Tests fehl, ist nicht der Test das Problem: Dann
   braucht die Seite entweder eine Einwilligungslösung, oder der eingebaute
   Dienst muss wieder raus.
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

test("kein fremder Host wird kontaktiert", async ({ page, baseURL }) => {
  const eigen = new URL(baseURL!).host;
  const fremde = new Set<string>();

  page.on("request", (r) => {
    const host = new URL(r.url()).host;
    // data:- und blob:-URLs haben keinen Host und sind unkritisch.
    if (host && host !== eigen) fremde.add(host);
  });

  for (const pfad of SEITEN) {
    await page.goto(pfad, { waitUntil: "networkidle" });
  }

  expect(
    [...fremde],
    "Die Datenschutzerklärung sagt zu, dass kein fremder Server kontaktiert wird.",
  ).toEqual([]);
});

test("kein Cookie und kein Browserspeicher für Besucher", async ({ page, context }) => {
  for (const pfad of SEITEN) {
    await page.goto(pfad, { waitUntil: "networkidle" });
  }

  // Den Konfigurator bedienen — auch dabei darf nichts abgelegt werden.
  await page.goto("/leistungen/entruempelung");
  await page.locator("#rechner").getByRole("button", { name: "Unverbindlich anfragen" }).click();

  const cookies = await context.cookies();
  expect(
    cookies.map((c) => c.name),
    "Ohne Cookies kommt die Seite ohne Einwilligungsbanner aus.",
  ).toEqual([]);

  const speicher = await page.evaluate(() => ({
    lokal: Object.keys(localStorage),
    sitzung: Object.keys(sessionStorage),
  }));
  expect(speicher.lokal).toEqual([]);
  expect(speicher.sitzung).toEqual([]);
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
});
