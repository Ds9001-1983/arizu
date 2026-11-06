import { expect, test, type Page } from "@playwright/test";
import { getService } from "../lib/services";
import {
  EINWILLIGUNG_COOKIE,
  EINWILLIGUNG_VERSION,
  einwilligungWert,
  leseEinwilligung,
} from "../lib/tracking/einwilligung";
import { META_PIXEL_ID } from "../lib/tracking/meta";

/* ==================================================================
   Einwilligungsbanner, Meta-Pixel und Conversions API (06.11.2026).

   Kein Test spricht mit Meta: fbevents.js wird durch ein leeres Skript
   ersetzt, Aufrufe an facebook.com werden abgebrochen und /api/meta wird
   abgefangen. Der Platzhalter von fbq sammelt dann alle Aufrufe in
   fbq.queue, genau das prüfen die Tests: welches Ereignis mit welcher
   event_id. Dieselbe ID muss im Aufruf an den Server stehen (/api/meta,
   /api/lead bzw. das Formular der Kundenart-Weiche), sonst kann Meta Pixel
   und Conversions API nicht zusammenführen.

   Ohne Entscheidung und nach „Nur notwendige“ darf nichts von alledem
   passieren (dazu auch datenschutz.spec.ts).
   ================================================================== */

type FbqAufruf = [string, ...unknown[]];

const leer = { cookies: [], origins: [] };

async function metaAbfangen(page: Page) {
  const anMeta: Record<string, unknown>[] = [];
  const fremd: string[] = [];
  await page.route(/connect\.facebook\.net/, (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.route(/facebook\.com/, (route) => route.abort());
  await page.route("**/api/meta", async (route) => {
    anMeta.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({ status: 204 });
  });
  page.on("request", (r) => {
    if (/facebook\.(net|com)/.test(new URL(r.url()).host)) fremd.push(r.url());
  });
  return { anMeta, fremd };
}

async function fbqAufrufe(page: Page): Promise<FbqAufruf[]> {
  return page.evaluate(
    () => ((window.fbq as unknown as { queue?: FbqAufruf[] } | undefined)?.queue ?? []) as FbqAufruf[],
  );
}

function ereignis(aufrufe: FbqAufruf[], name: string) {
  const treffer = aufrufe.find((a) => (a[0] === "track" || a[0] === "trackCustom") && a[1] === name);
  return treffer
    ? {
        art: treffer[0],
        daten: treffer[2] as Record<string, string>,
        eventId: (treffer[3] as { eventID: string }).eventID,
      }
    : undefined;
}

function cookieMitMarketing(baseURL: string) {
  return {
    name: EINWILLIGUNG_COOKIE,
    value: einwilligungWert(true),
    domain: new URL(baseURL).hostname,
    path: "/",
  };
}

const banner = (page: Page) => page.locator("[data-einwilligung]");

test.describe("Banner beim ersten Besuch", () => {
  test.use({ storageState: leer });

  test("Ablehnen und Zustimmen sind gleichwertig, nichts ist vorausgewählt", async ({ page }) => {
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
    await expect(
      banner(page).getByRole("heading", { name: "Cookies und Werbemessung" }),
    ).toBeVisible();

    const ja = banner(page).getByRole("button", { name: "Alle akzeptieren" });
    const nein = banner(page).getByRole("button", { name: "Nur notwendige" });
    await expect(ja).toBeVisible();
    await expect(nein).toBeVisible();

    // Gleiche Farbe, Schrift und Größe: kein Dark Pattern über die Gestaltung.
    const stil = (b: typeof ja) =>
      b.evaluate((el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          hintergrund: s.backgroundColor,
          farbe: s.color,
          schrift: `${s.fontSize} ${s.fontWeight} ${s.fontFamily}`,
          hoehe: Math.round(r.height),
          breite: Math.round(r.width),
        };
      });
    expect(await stil(ja)).toEqual(await stil(nein));
    expect((await stil(ja)).hoehe).toBeGreaterThanOrEqual(44);

    // „Alle akzeptieren“ steht rechts neben „Nur notwendige“ (06.11.2026),
    // auf schmalen Handys darunter.
    const [rJa, rNein] = [await ja.boundingBox(), await nein.boundingBox()];
    expect(rJa!.x > rNein!.x || rJa!.y > rNein!.y).toBe(true);

    await banner(page).getByRole("button", { name: "Einstellungen" }).click();
    const titel = banner(page).getByRole("heading", { name: "Cookie-Einstellungen" });
    await expect(titel).toBeFocused();
    await expect(banner(page).getByLabel("Marketing")).not.toBeChecked();
    const notwendig = banner(page).getByLabel(/^Notwendig/);
    await expect(notwendig).toBeChecked();
    await expect(notwendig).toBeDisabled();
  });

  test("Tastatur erreicht den Banner zuerst", async ({ page }) => {
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => Boolean(document.activeElement?.closest("[data-einwilligung]"))),
    ).toBe(true);
  });

  test("Nur notwendige: Cookie mit Version und Datum, nichts von Meta", async ({
    page,
    context,
  }) => {
    const { anMeta, fremd } = await metaAbfangen(page);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Nur notwendige" }).click();
    await expect(banner(page)).toHaveCount(0);

    const cookie = (await context.cookies()).find((c) => c.name === EINWILLIGUNG_COOKIE);
    const wert = leseEinwilligung(cookie?.value);
    expect(wert).toMatchObject({ v: EINWILLIGUNG_VERSION, marketing: false });
    expect(Math.abs(Date.parse(wert!.datum) - Date.now())).toBeLessThan(60_000);
    // Zwölf Monate Laufzeit, auf einen Tag genau.
    const tage = (cookie!.expires * 1000 - Date.now()) / 86_400_000;
    expect(tage).toBeGreaterThan(364);
    expect(tage).toBeLessThan(366);

    await page.goto("/leistungen/entruempelung", { waitUntil: "networkidle" });
    await expect(banner(page)).toHaveCount(0);
    expect(fremd).toEqual([]);
    expect(anMeta).toEqual([]);
    expect(await page.evaluate(() => typeof window.fbq)).toBe("undefined");
  });

  test("Alle akzeptieren: Pixel ohne Automatik, PageView und ViewContent mit gemeinsamer event_id", async ({
    page,
    context,
  }) => {
    const { anMeta, fremd } = await metaAbfangen(page);
    await page.goto("/leistungen/entruempelung", { waitUntil: "networkidle" });
    expect(fremd, "vor der Einwilligung nichts von Meta").toEqual([]);

    await banner(page).getByRole("button", { name: "Alle akzeptieren" }).click();
    await expect(banner(page)).toHaveCount(0);
    await expect.poll(() => fremd.some((u) => u.includes("fbevents.js"))).toBe(true);
    await expect.poll(() => anMeta.length).toBe(2);

    const aufrufe = await fbqAufrufe(page);
    expect(aufrufe).toContainEqual(["set", "autoConfig", false, META_PIXEL_ID]);
    expect(aufrufe).toContainEqual(["init", META_PIXEL_ID]);

    const seite = ereignis(aufrufe, "PageView");
    const leistung = ereignis(aufrufe, "ViewContent");
    expect(seite?.art).toBe("track");
    expect(leistung?.daten).toMatchObject({
      content_name: getService("entruempelung")!.name,
    });
    expect(anMeta).toContainEqual(
      expect.objectContaining({ name: "PageView", eventId: seite!.eventId }),
    );
    expect(anMeta).toContainEqual(
      expect.objectContaining({
        name: "ViewContent",
        eventId: leistung!.eventId,
        daten: expect.objectContaining({ content_name: getService("entruempelung")!.name }),
      }),
    );
    expect(seite!.eventId).not.toBe(leistung!.eventId);

    const cookie = (await context.cookies()).find((c) => c.name === EINWILLIGUNG_COOKIE);
    expect(leseEinwilligung(cookie?.value)?.marketing).toBe(true);

    // Wechsel ohne Neuladen: ViewContent für die neue Leistung, aber kein
    // zweiter PageView von uns. Den meldet der Pixel selbst; fbevents.js
    // verwirft einen zweiten manuellen PageView pro Seitenaufruf.
    await page.locator("footer").getByRole("link", { name: getService("gebaeudereinigung")!.name }).click();
    await expect(page).toHaveURL(/gebaeudereinigung/);
    await expect.poll(() => anMeta.length).toBe(3);
    expect(anMeta.filter((e) => e.name === "PageView")).toHaveLength(1);
    expect(anMeta[2]).toMatchObject({
      name: "ViewContent",
      daten: { content_name: getService("gebaeudereinigung")!.name },
    });
  });
});

test.describe("mit Marketing-Einwilligung", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([cookieMitMarketing(baseURL!)]);
  });

  test("Klick auf Telefon und WhatsApp meldet Contact", async ({ page }) => {
    const { anMeta } = await metaAbfangen(page);
    // Der WhatsApp-Link öffnet einen neuen Tab: im ganzen Kontext abfangen.
    await page.context().route(/api\.whatsapp\.com/, (route) => route.abort());
    await page.goto("/kontakt", { waitUntil: "networkidle" });
    await expect.poll(() => anMeta.length).toBe(1); // PageView

    await page.locator("footer a[href^='tel:']").click();
    await expect
      .poll(() => anMeta.filter((e) => e.name === "Contact").length)
      .toBe(1);
    await page.locator("main a[href*='api.whatsapp.com']").first().click();
    await expect
      .poll(() => anMeta.filter((e) => e.name === "Contact").length)
      .toBe(2);

    const kontakte = anMeta.filter((e) => e.name === "Contact");
    expect(kontakte.map((e) => (e.daten as Record<string, string>).content_category)).toEqual([
      "Telefon",
      "WhatsApp",
    ]);
    const aufrufe = (await fbqAufrufe(page)).filter((a) => a[1] === "Contact");
    expect(aufrufe.map((a) => (a[3] as { eventID: string }).eventID)).toEqual(
      kontakte.map((e) => e.eventId),
    );
  });

  test("Kundenart-Weiche: KundenartGeschaeft mit derselben event_id an Pixel und Server", async ({
    page,
  }) => {
    await metaAbfangen(page);
    let actionBody = "";
    page.on("request", (r) => {
      if (r.method() === "POST" && r.headers()["next-action"]) actionBody = r.postData() ?? "";
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Zum Geschäftskundenbereich" }).click();
    await expect(page).toHaveURL(/\/geschaeftskunden$/);

    const weiche = ereignis(await fbqAufrufe(page), "KundenartGeschaeft");
    expect(weiche?.art).toBe("trackCustom");
    expect(weiche?.eventId).toMatch(/^[0-9a-f-]{36}$/);
    expect(actionBody, "die Server Action bekommt dieselbe event_id").toContain(weiche!.eventId);
  });

  test("Lead nach erfolgreicher Anfrage, mit der event_id der Anfrage", async ({ page }) => {
    await metaAbfangen(page);
    let anfrage: Record<string, unknown> | undefined;
    await page.route("**/api/lead", async (route) => {
      anfrage = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/kontakt");
    const form = page.locator("#anfrage form");
    await form.getByRole("radio", { name: "Privatkunde" }).check();
    await form.getByLabel(/^Name/).fill("Alex Muster");
    await form.getByLabel(/^Telefon/).fill("0179 5272126");
    await form.getByLabel(/^Straße und Hausnummer/).fill("Kaistraße 7");
    await form.getByLabel(/^PLZ/).fill("25348");
    await form.getByLabel(/^Ort/).fill("Glückstadt");
    await form.getByRole("checkbox").check();
    await form.getByRole("button", { name: "Anfrage senden" }).click();
    await expect(page.getByRole("heading", { name: "Anfrage ist angekommen" })).toBeVisible();

    const lead = ereignis(await fbqAufrufe(page), "Lead");
    expect(lead?.daten).toMatchObject({ content_category: "Privatkunde" });
    expect(anfrage?.eventId).toBe(lead?.eventId);
  });

  test("Widerruf über Cookie-Einstellungen: Fokus, Escape, Meta-Cookies weg, Pixel entladen", async ({
    page,
    context,
    baseURL,
  }) => {
    await metaAbfangen(page);
    await context.addCookies([
      { name: "_fbp", value: "fb.1.1762400000000.123456789", domain: new URL(baseURL!).hostname, path: "/" },
    ]);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(banner(page)).toHaveCount(0);

    const ausloeser = page.locator("footer").getByRole("button", { name: "Cookie-Einstellungen" });
    await ausloeser.click();
    await expect(banner(page).getByRole("heading", { name: "Cookie-Einstellungen" })).toBeFocused();
    await expect(banner(page).getByLabel("Marketing")).toBeChecked();

    await page.keyboard.press("Escape");
    await expect(banner(page)).toHaveCount(0);
    await expect(ausloeser).toBeFocused();

    // Lief der Pixel, lädt die Seite beim Widerruf neu: Gesperrt hielte er
    // Ereignisse zurück und schickte sie nach einer neuen Zustimmung nach.
    await ausloeser.click();
    await Promise.all([
      page.waitForEvent("load"),
      banner(page).getByRole("button", { name: "Nur notwendige" }).click(),
    ]);
    await page.waitForLoadState("networkidle");
    await expect(banner(page)).toHaveCount(0);
    expect(await page.evaluate(() => typeof window.fbq)).toBe("undefined");

    const cookies = await context.cookies();
    expect(cookies.map((c) => c.name)).not.toContain("_fbp");
    expect(
      leseEinwilligung(cookies.find((c) => c.name === EINWILLIGUNG_COOKIE)?.value)?.marketing,
    ).toBe(false);
  });

  test("Auswahl ändern ohne laufenden Pixel gibt den Fokus zurück", async ({ page, context }) => {
    // Ohne Marketing lädt kein Pixel, ein Wechsel der Auswahl braucht dann
    // kein Neuladen, und der Fokus geht zurück auf den Auslöser.
    await context.clearCookies();
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Nur notwendige" }).click();
    const ausloeser = page.locator("footer").getByRole("button", { name: "Cookie-Einstellungen" });
    await ausloeser.click();
    await expect(banner(page).getByLabel("Marketing")).not.toBeChecked();
    await banner(page).getByRole("button", { name: "Auswahl speichern" }).click();
    await expect(banner(page)).toHaveCount(0);
    await expect(ausloeser).toBeFocused();
  });
});

test.describe("/api/meta", () => {
  const gueltig = (baseURL: string) => ({
    name: "PageView",
    eventId: "3f1d3c8c-1f83-4122-b401-fd1f04b2114d",
    url: `${baseURL}/`,
  });

  test("ohne Einwilligung passiert nichts", async ({ request, baseURL }) => {
    const antwort = await request.post("/api/meta", { data: gueltig(baseURL!) });
    expect(antwort.status()).toBe(204);
  });

  test("nimmt nur die freigegebenen Ereignisse und die eigene Adresse an", async ({
    request,
    baseURL,
  }) => {
    const cookie = `${EINWILLIGUNG_COOKIE}=${einwilligungWert(true)}`;
    const mit = { headers: { cookie } };
    expect(
      (await request.post("/api/meta", { ...mit, data: { ...gueltig(baseURL!), name: "Lead" } })).status(),
      "Lead meldet nur die Anfrage-Route selbst",
    ).toBe(400);
    expect(
      (await request.post("/api/meta", {
        ...mit,
        data: { ...gueltig(baseURL!), url: "https://example.com/" },
      })).status(),
    ).toBe(400);
    expect(
      (await request.post("/api/meta", {
        headers: { cookie, "sec-fetch-site": "cross-site" },
        data: gueltig(baseURL!),
      })).status(),
    ).toBe(403);
  });
});
