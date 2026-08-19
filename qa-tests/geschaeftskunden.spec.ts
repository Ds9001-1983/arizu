import { expect, test } from "@playwright/test";

/* ==================================================================
   Trennung Privat- und Geschäftskunden (Kundengespräch 14.08.2026).

   Geprüft wird das, was Arian ausdrücklich verlangt hat: eine minimalistische
   Startseite, getrennte Privat-/Geschäftskundenwege, ein Geschäftskundenbereich
   OHNE öffentlichen Preisrahmen und ein Formular mit den wesentlichen
   Pflichtangaben.
   ================================================================== */

const PREISSPANNE = /\d[\d.]*\s*€\s*–\s*\d[\d.]*\s*€/;

const LEISTUNGEN = [
  "Gebäudereinigung",
  "Grün- und Außenanlagenpflege",
  "Entrümpelung und Auflösung",
  "Objektbetreuung",
];

const RECHNER_LEISTUNGEN = LEISTUNGEN.slice(0, 3);
const UNVERBINDLICHKEIT =
  "Der angezeigte Betrag dient ausschließlich der ersten Orientierung. " +
  "Der tatsächliche Preis kann aufgrund der örtlichen Gegebenheiten, des " +
  "tatsächlichen Aufwands und weiterer nicht im Rechner erfasster Faktoren " +
  "abweichen. Ein verbindliches Angebot entsteht erst nach individueller " +
  "Prüfung und Bestätigung durch ARIZU.";

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

test("Privatkundenkacheln stehen in der vereinbarten Reihenfolge", async ({
  page,
}) => {
  await page.goto("/privatkunden");
  const leistungen = page
    .getByRole("heading", { name: "Vier Bereiche, ein Ansprechpartner" })
    .locator("xpath=ancestor::section");

  await expect(leistungen.locator("h3")).toHaveCount(4);
  expect(await leistungen.locator("h3").allInnerTexts()).toEqual(LEISTUNGEN);

  const objektbetreuung = leistungen.locator(
    'a[href="/leistungen/objektbetreuung"]',
  );
  await expect(objektbetreuung).toContainText("Objektbetreuung anfragen");
});

test("Privatkunden nutzen den zentralen Kontaktweg statt eines zweiten Formulars", async ({
  page,
}) => {
  await page.goto("/privatkunden");

  await expect(page.locator("#anfrage")).toHaveCount(0);
  const kontakt = page.getByRole("link", { name: "Zum Kontakt", exact: true });
  await expect(kontakt).toBeVisible();
  await expect(kontakt).toHaveAttribute("href", "/kontakt");
});

test("weiße Grundfläche und warme Karten bilden die vereinbarte Farbrolle", async ({
  page,
}) => {
  await page.goto("/privatkunden");

  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(
    page.locator('a[href="/leistungen/gebaeudereinigung"]').first(),
  ).toHaveCSS("background-color", "rgb(245, 243, 239)");
});

test("genau drei Live-Rechner zeigen Preisrahmen, Hinweise und Anfrage-CTA", async ({
  page,
}) => {
  await page.goto("/privatkunden");
  const tablist = page.getByRole("tablist", { name: "Leistung wählen" });

  await expect(tablist.getByRole("tab")).toHaveCount(3);
  expect(await tablist.getByRole("tab").allInnerTexts()).toEqual(RECHNER_LEISTUNGEN);
  await expect(tablist.getByRole("tab", { name: "Objektbetreuung" })).toHaveCount(0);

  for (const leistung of RECHNER_LEISTUNGEN) {
    await tablist.getByRole("tab", { name: leistung, exact: true }).click();
    const panel = page.getByRole("tabpanel");

    await expect(panel.locator("p[aria-live='polite']")).toHaveText(PREISSPANNE);
    await expect(
      panel.getByText("Voraussichtlicher Preisrahmen", { exact: true }),
    ).toBeVisible();
    await expect(
      panel.getByText("Unverbindliche Preisschätzung", { exact: true }),
    ).toBeVisible();
    await expect(panel).toContainText(UNVERBINDLICHKEIT);
    await expect(panel.getByText("Grundlage der Berechnung", { exact: true })).toBeVisible();
    await expect(
      panel.getByText("Die Berechnung basiert auf folgenden Angaben:", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      panel.getByText(/Nicht berücksichtigt werden können beispielsweise/),
    ).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Unverbindliche Anfrage stellen" }),
    ).toBeVisible();
  }
});

test("Objektbetreuungs-Rechner und seine Raten landen nicht im Client-Bundle", async ({
  page,
}) => {
  const clientScripts: string[] = [];
  page.on("response", async (response) => {
    if (response.request().resourceType() !== "script") return;
    if (!response.url().includes("/_next/static/")) return;
    clientScripts.push(await response.text());
  });

  await page.goto("/privatkunden");
  await page.waitForLoadState("networkidle");

  expect(clientScripts.join("\n")).not.toContain("Objektbetreuung berechnen");
  expect(clientScripts.join("\n")).not.toContain("Grundbetreuung");
});

test("vereinbarte Haupt- und Anfrage-Texte stehen vollständig auf den Seiten", async ({
  page,
}) => {
  await page.goto("/");
  const warum = page
    .getByRole("heading", {
      name: "Ein Ansprechpartner. Klare Lösungen. Verlässliche Leistung.",
    })
    .locator("xpath=ancestor::section");
  await expect(warum).toContainText(
    "Wir denken mit, packen an und übernehmen Verantwortung. Ob Gebäudereinigung, Grün- und Außenanlagenpflege, Entrümpelung und Auflösung oder eine umfassende Objektbetreuung – ARIZU steht für professionelle Dienstleistungen aus einer Hand, persönliche Betreuung und verlässliche Ergebnisse.",
  );

  await page.goto("/privatkunden");
  const privatHero = page.locator("main > section").first();
  await expect(privatHero).toContainText(
    "Wir bieten Ihnen professionelle Dienstleistungen aus einer Hand. Wir stehen für zuverlässige Ausführung, transparente Abläufe und faire Preise.",
  );
  await expect(privatHero).toContainText(
    "Dank unserer digitalen Preiseinschätzung können Sie sich direkt einen ersten Eindruck von den Kosten verschaffen – schnell, unkompliziert und ohne Kontaktdaten.",
  );

  await page.goto("/kontakt");
  await expect(page.locator("main > section").first()).toContainText(
    "Telefonisch, per WhatsApp oder über unser Kontaktformular – wählen Sie den Weg, der für Sie am einfachsten ist. Wenn wir gerade nicht erreichbar sind, melden wir uns selbstverständlich zeitnah bei Ihnen.",
  );
  const anfrage = page.locator("#anfrage");
  await expect(anfrage).toContainText("Wir kümmern uns um Ihr Anliegen.");
  await expect(anfrage).toContainText(
    "Ob einzelne Dienstleistung oder umfassende Betreuung – schildern Sie uns kurz, was Sie benötigen. Wir melden uns in der Regel noch am selben Werktag bei Ihnen und besprechen gemeinsam die nächsten Schritte.",
  );
  await expect(anfrage).toContainText(
    "Die Besichtigung vor Ort ist kostenlos und unverbindlich.",
  );
});

test("Objektbetreuung hat keinen öffentlichen Rechner und führt zur Anfrage", async ({
  page,
}) => {
  await page.goto("/leistungen/objektbetreuung");

  await expect(page.locator("#rechner")).toHaveCount(0);
  await expect(page.locator("p[aria-live='polite']")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("Voraussichtlicher Preisrahmen");
  expect(await page.locator("main").innerText()).not.toMatch(PREISSPANNE);

  await expect(
    page.getByRole("link", { name: "Objektbetreuung anfragen" }),
  ).toHaveAttribute("href", "#anfrage");
  await expect(page.locator("#anfrage form")).toBeVisible();
  await expect(page.locator("#anfrage select[name='service']")).toHaveValue(
    "objektbetreuung",
  );
  await expect(
    page.getByText("Hausmeister-Service", { exact: true }),
  ).toBeVisible();
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
  await expect(page.locator('header a[href="tel:+4941214206881"]')).toBeAttached();
  await expect(page.locator("body")).not.toContainText("0179 52 72 126");

  await page.goto("/kontakt");
  await expect(
    page.getByRole("img", { name: /Arian Aslani, Inhaber/ }),
  ).toBeVisible();
  await expect(page.locator("main").getByText("04121 42 06 881").first()).toBeVisible();
});

test("Geschäftskundenbereich nennt keinen öffentlichen Preisrahmen", async ({
  page,
}) => {
  await page.goto("/geschaeftskunden");
  // Die Preisspalte des Konfigurators darf hier nicht vorkommen …
  await expect(page.locator("p[aria-live='polite']")).toHaveCount(0);
  // … und auch sonst keine Preisspanne im Text.
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/\d[\d.]*\s*€\s*–\s*\d[\d.]*\s*€/);
});

test("Geschäftskundenbereich enthält die neuen Hero- und Leistungstexte", async ({
  page,
}) => {
  await page.goto("/geschaeftskunden");
  const hero = page.locator("main > section").first();

  await expect(
    hero.getByRole("heading", {
      name: "Gebäudedienstleistungen für Unternehmen, Hausverwaltungen & Gewerbeimmobilien",
    }),
  ).toBeVisible();
  await expect(hero).toContainText(
    "Wir übernehmen Reinigung, Objektbetreuung sowie die Pflege von Außenanlagen",
  );
  await expect(hero).toContainText(
    "Nach einer persönlichen Besichtigung vor Ort erhalten Sie ein transparentes Angebot",
  );

  const leistungen = page
    .getByRole("heading", { name: "Was wir für Geschäftskunden übernehmen" })
    .locator("xpath=ancestor::section");
  await expect(leistungen).toContainText(
    "Von einzelnen Dienstleistungen bis zur umfassenden Objektbetreuung",
  );
  await expect(leistungen).toContainText("Grün- und Außenanlagenpflege");
  await expect(leistungen).toContainText("Entrümpelung und Auflösung");
  await expect(leistungen).toContainText("Büro- und Gewerbeentrümpelungen");
});

test("Geschäftskunden sehen sechs Objektarten einschließlich der Erweiterungen", async ({
  page,
}) => {
  await page.goto("/geschaeftskunden");
  const objekte = page
    .getByRole("heading", { name: "Objekte, die wir betreuen" })
    .locator("xpath=ancestor::section");

  await expect(objekte.locator("h3")).toHaveCount(6);
  await expect(
    objekte.getByRole("heading", { name: "Bildung & öffentliche Einrichtungen" }),
  ).toBeVisible();
  await expect(objekte).toContainText(
    "Zuverlässige Reinigung und Betreuung für Schulen, Kitas, Verwaltungsgebäude und öffentliche Einrichtungen",
  );
  await expect(
    objekte.getByRole("heading", { name: "Weitere Objekte" }),
  ).toBeVisible();
  await expect(objekte).toContainText(
    "Individuelle Dienstleistungen für Gewerbe-, Wohn- und Sonderobjekte",
  );
});

test("Wie wir arbeiten zeigt alle sechs vereinbarten Standards", async ({ page }) => {
  await page.goto("/geschaeftskunden");
  const arbeitsweise = page
    .getByRole("heading", { name: "Wie wir arbeiten" })
    .locator("xpath=ancestor::section");

  expect(await arbeitsweise.locator("h3").allInnerTexts()).toEqual([
    "Ein Ansprechpartner",
    "Klare Prozesse",
    "Feste Leistungsstandards",
    "Planbare Betreuung",
    "Schnelle Reaktion",
    "Transparente Abrechnung",
  ]);

  for (const aussage of [
    "Direkte Kommunikation ohne Umwege.",
    "Strukturierte Abläufe von der Anfrage bis zur laufenden Betreuung.",
    "Definierte Leistungen sorgen für nachvollziehbare Qualität.",
    "Regelmäßige Leistungen werden zuverlässig eingehalten.",
    "Zusätzlicher Bedarf wird unkompliziert aufgenommen und abgestimmt.",
    "Nachvollziehbar, übersichtlich und passend zum vereinbarten Leistungsumfang.",
  ]) {
    await expect(arbeitsweise).toContainText(aussage);
  }
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

test("Einsatzgebiet nennt Hamburg und 50 km in UI, JSON-LD und llms.txt", async ({
  page,
  request,
}) => {
  await page.goto("/kontakt");
  const kontaktGebiet = page
    .getByRole("heading", { name: "Anschrift & Einsatzgebiet" })
    .locator("xpath=..");
  await expect(kontaktGebiet).toContainText("Kreis Pinneberg und Hamburg");
  await expect(kontaktGebiet).toContainText("50 km um Elmshorn");
  await expect(page.locator("footer")).toContainText(
    "Einsatzgebiet: Kreis Pinneberg und Hamburg",
  );
  await expect(page.locator("footer")).toContainText("50 km um Elmshorn");

  await page.goto("/");
  const jsonLd = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).join("\n");
  expect(jsonLd).toContain(
    '"@type":"AdministrativeArea","name":"Kreis Pinneberg"',
  );
  expect(jsonLd).toContain('"@type":"City","name":"Hamburg"');
  expect(jsonLd).toContain('"geoRadius":50000');

  const llms = await (await request.get("/llms.txt")).text();
  expect(llms).toContain("Hamburg");
  expect(llms).toContain("Umkreis 50 km um Elmshorn");

  for (const slug of [
    "objektbetreuung",
    "gebaeudereinigung",
    "gartenpflege",
    "entruempelung",
  ]) {
    await page.goto(`/leistungen/${slug}`);
    await expect(page.locator("main")).toContainText(
      "Kreis Pinneberg und Hamburg",
    );
    await expect(page.locator("main")).toContainText("50 km um Elmshorn");
    const serviceJsonLd = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join("\n");
    expect(serviceJsonLd).toContain('"geoRadius":50000');
  }
});

test("Kostenfragen fehlen sichtbar und in den strukturierten FAQ-Daten", async ({
  page,
}) => {
  const kostenfrage =
    /Was kostet .*(?:Quadratmeter|Wohneinheit)|Warum steht hier kein Preis/i;

  for (const pfad of [
    "/privatkunden",
    "/leistungen/objektbetreuung",
    "/leistungen/gebaeudereinigung",
    "/leistungen/gartenpflege",
    "/leistungen/entruempelung",
    "/geschaeftskunden",
  ]) {
    await page.goto(pfad);
    const sichtbareFragen = (await page.locator("details summary").allInnerTexts()).join(
      "\n",
    );
    expect(sichtbareFragen, `sichtbare Kostenfrage auf ${pfad}`).not.toMatch(
      kostenfrage,
    );

    const strukturierteDaten = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join("\n");
    expect(strukturierteDaten, `Kostenfrage im JSON-LD auf ${pfad}`).not.toMatch(
      kostenfrage,
    );
  }
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
  await expect(
    page.getByText("Bau- und Bauendreinigung", { exact: true }),
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
