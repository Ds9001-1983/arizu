import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { mkdirSync } from "node:fs";

/* ==================================================================
   Pflicht-Check der KI-Kennzeichnung (Art. 50 EU AI Act).

   Der Test prüft nicht nur, DASS ein Badge existiert, sondern dass für jedes
   im story-spec als kennzeichnungspflichtig geführte Asset auch tatsächlich
   eines sichtbar auf der Seite steht. Damit kann die Kennzeichnung nicht
   stillschweigend verloren gehen, wenn jemand später ein Bild austauscht.

   Die Screenshots landen in qa-reports/ai-disclosure/ und dienen als Nachweis,
   dass die Kennzeichnung zum Zeitpunkt der Auslieferung sichtbar war.
   ================================================================== */

type Spec = {
  assets: {
    id: string;
    ai_disclosure: {
      required: boolean;
      reason: string;
      badge?: { position: string; label?: string };
      metadata_tagged?: boolean;
    };
  }[];
};

const spec = JSON.parse(readFileSync("story-spec.json", "utf8")) as Spec;
const pflichtig = spec.assets.filter((a) => a.ai_disclosure.required);

/* Wo welches Asset zu sehen ist. */
const seiten: Record<string, string> = {
  "img-hero": "/",
  "img-privatgarten-hero": "/privatkunden",
  "img-objektbetreuung": "/privatkunden",
  "img-gebaeudereinigung": "/privatkunden",
  "img-gartenpflege": "/privatkunden",
  "img-entruempelung": "/privatkunden",
  "img-arian-portrait-v3": "/kontakt",
};

const EVIDENCE = "qa-reports/ai-disclosure";

test.beforeAll(() => {
  mkdirSync(EVIDENCE, { recursive: true });
});

test("story-spec dokumentiert jeden Entscheid, auch die Nein-Entscheide", () => {
  expect(spec.assets.length).toBeGreaterThan(0);
  for (const asset of spec.assets) {
    expect(asset.ai_disclosure.reason, `Asset ${asset.id} ohne Begründung`).toBeTruthy();
    if (asset.ai_disclosure.required) {
      // Pflichtige Assets brauchen Badge UND gesetzte Metadaten.
      expect(asset.ai_disclosure.badge, `Asset ${asset.id} ohne Badge-Position`).toBeTruthy();
      expect(
        asset.ai_disclosure.metadata_tagged,
        `Asset ${asset.id} ohne Metadaten-Tag`,
      ).toBe(true);
    }
  }
});

for (const asset of pflichtig) {
  test(`Badge sichtbar für ${asset.id}`, async ({ page }, testInfo) => {
    const pfad = seiten[asset.id];
    expect(pfad, `Keine Seite für ${asset.id} hinterlegt`).toBeTruthy();

    await page.goto(pfad);
    const badge = page.locator(`[data-ai-badge="${asset.id}"]`);

    // scrollIntoViewIfNeeded: Die Kachelbilder liegen unter der Falz.
    await badge.scrollIntoViewIfNeeded();
    await expect(badge).toBeVisible();

    // Kein Icon-only-Badge: Der Text ist nach BFSG Pflicht. Der Kundenwunsch
    // nach einer dezenteren Darstellung ändert daran nichts. Bewusst keine
    // feste Mindestgröße: Sichtbarkeit, Text und freie Motivfläche sind die
    // belastbaren Anforderungen, nicht ein willkürlicher Pixelwert.
    await expect(badge).toContainText(/KI-generiert|mit KI erstellt/i);

    // Das Badge darf kein Produkt-/Hauptmotiv verdecken (Kaminofen-Regel).
    const produkte = await page.locator("[data-product]").count();
    if (produkte > 0) {
      const badgeBox = await badge.boundingBox();
      for (let i = 0; i < produkte; i++) {
        const box = await page.locator("[data-product]").nth(i).boundingBox();
        if (!badgeBox || !box) continue;
        const overlap =
          badgeBox.x < box.x + box.width &&
          badgeBox.x + badgeBox.width > box.x &&
          badgeBox.y < box.y + box.height &&
          badgeBox.y + badgeBox.height > box.y;
        expect(overlap, `Badge ${asset.id} überdeckt ein [data-product]`).toBe(false);
      }
    }

    // Belegscreenshot: das Bild samt Badge, nicht nur das Badge allein.
    const figure = badge.locator("xpath=..");
    await figure.screenshot({
      path: `${EVIDENCE}/${asset.id}-${testInfo.project.name}.png`,
    });
  });
}

test("Startseitenmotiv wird im Geschäftskunden-Hero korrekt wiederverwendet", async ({
  page,
}, testInfo) => {
  await page.goto("/geschaeftskunden");
  const hero = page.locator("main > section").first();

  await expect(hero.locator('[data-ai-badge="img-hero"]')).toBeVisible();
  await expect(hero.locator("img")).toHaveAttribute(
    "src",
    "/images/hero-gebaeude.webp",
  );
  await expect(hero.locator("video")).toHaveAttribute(
    "src",
    testInfo.project.name === "mobil"
      ? "/video/hero-gebaeude-mobil.mp4"
      : "/video/hero-gebaeude.mp4",
  );
});

test("kein Chatbot vorhanden, also auch kein AiNotice nötig", async ({ page }) => {
  await page.goto("/");
  // Wäre ein Chat-Auslöser vorhanden, müsste er data-chat-launcher tragen und
  // der Hinweis am Chat-Start geprüft werden. Dieses Projekt hat bewusst keinen.
  await expect(page.locator("[data-chat-launcher]")).toHaveCount(0);
});
