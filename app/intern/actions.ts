"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionMaxAge,
  verifyPassword,
} from "@/lib/auth";
import {
  type LeadKundenart,
  type LeadStatus,
  clearRate,
  clearRates,
  setBillingAddress,
  setRate,
  updateLead,
} from "@/lib/db";
import { configurators, getConfigurator } from "@/lib/pricing";

/**
 * Fehlversuche pro Instanz mitzählen.
 *
 * Kein Ersatz für eine echte Sperre (serverlos ist der Speicher flüchtig),
 * aber es macht Durchprobieren spürbar teurer. Zusammen mit PBKDF2 bei
 * 210.000 Iterationen ist Brute Force damit unattraktiv.
 */
const attempts = new Map<string, { count: number; until: number }>();
const LOCK_AFTER = 8;
const LOCK_MS = 10 * 60_000;

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const hash = process.env.ARIZU_ADMIN_PASSWORD_HASH;
  const secret = process.env.SESSION_SECRET;

  if (!hash || !secret) {
    redirect("/intern/login?fehler=nicht-eingerichtet");
  }

  const key = "single-user";
  const state = attempts.get(key);
  if (state && state.until > Date.now() && state.count >= LOCK_AFTER) {
    redirect("/intern/login?fehler=gesperrt");
  }

  if (!(await verifyPassword(password, hash))) {
    const count = (state?.count ?? 0) + 1;
    attempts.set(key, { count, until: Date.now() + LOCK_MS });
    redirect("/intern/login?fehler=falsch");
  }

  attempts.delete(key);
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge,
  });
  redirect("/intern");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/intern/login");
}

const STATUS: LeadStatus[] = ["neu", "kontaktiert", "angebot", "gewonnen", "verloren"];
const KUNDENART: LeadKundenart[] = ["privat", "geschaeft"];

export async function saveLead(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  const statusRaw = String(formData.get("status") ?? "");
  const status = STATUS.includes(statusRaw as LeadStatus)
    ? (statusRaw as LeadStatus)
    : undefined;

  // Array-Whitelist statt zod, wie beim Status: /intern liegt hinter der
  // Anmeldung, und zod gehört in diesem Projekt ausschließlich nach app/api/.
  const kundenartRaw = String(formData.get("kundenart") ?? "");
  const kundenart = KUNDENART.includes(kundenartRaw as LeadKundenart)
    ? (kundenartRaw as LeadKundenart)
    : undefined;

  await updateLead(id, {
    name: String(formData.get("name") ?? "") || undefined,
    phone: String(formData.get("phone") ?? "") || undefined,
    email: String(formData.get("email") ?? "") || undefined,
    strasse: String(formData.get("strasse") ?? "") || undefined,
    plz: String(formData.get("plz") ?? "") || undefined,
    ort: String(formData.get("ort") ?? "") || undefined,
    // Das Feld, das Arian beim Kunden korrigiert: „sind doch 74 m², nicht 60".
    konfigurator: String(formData.get("konfigurator") ?? "") || undefined,
    note: String(formData.get("note") ?? "") || undefined,
    status,
    kundenart,
  });

  // Getrennt, weil diese Felder auch wieder geleert werden können müssen —
  // updateLead behält per coalesce den alten Wert.
  await setBillingAddress(id, {
    name: String(formData.get("rg_name") ?? ""),
    strasse: String(formData.get("rg_strasse") ?? ""),
    plz: String(formData.get("rg_plz") ?? ""),
    ort: String(formData.get("rg_ort") ?? ""),
  });

  revalidatePath("/intern");
  revalidatePath(`/intern/${id}`);
  redirect(`/intern/${id}?gespeichert=1`);
}

/* ------------------------------------------------------------ Preispflege */

/**
 * Die öffentlichen Seiten sind statisch vorgerendert. Ohne diese Aufrufe
 * stünde der alte Preis dort bis zum nächsten Deploy.
 *
 * Bewusst die VIER KONKRETEN Pfade und nicht `revalidatePath("/leistungen/
 * [slug]", "page")`. Das Muster wäre die naheliegende Kurzform, macht die
 * Leistungsseiten hier aber dauerhaft zu 404: Die Route steht auf
 * `dynamicParams = false`, und nach dem Verwerfen des Musters findet Next
 * keinen Fallback mehr, um sie neu zu erzeugen — im Log erscheint
 * `NoFallbackError`. Einzelne Pfade werden dagegen sauber regeneriert, weil
 * sie in `generateStaticParams` stehen.
 */
function preiseAuffrischen() {
  revalidatePath("/privatkunden");
  for (const slug of Object.keys(configurators)) {
    revalidatePath(`/leistungen/${slug}`);
  }
  revalidatePath("/intern/preise");
}

export async function savePreise(formData: FormData) {
  const slug = String(formData.get("konfigurator") ?? "");
  const spec = getConfigurator(slug);
  if (!spec) return;

  // Über die im Code bekannten Felder iterieren und damit das Formular
  // befragen — nie umgekehrt. So kann ein manipuliertes Feld keinen fremden
  // Schlüssel in die Tabelle bringen.
  for (const f of spec.rateFields) {
    const roh = String(formData.get(`satz.${f.key}`) ?? "").trim();

    if (roh === "") {
      await clearRate(slug, f.key);
      continue;
    }

    // Arian tippt "10,50". Number() macht daraus NaN.
    const n = Number(roh.replace(/\./g, "").replace(",", "."));

    /* Technische Grenzen, KEINE kaufmännische Bewertung: NaN oder ein
       negativer Betrag würden die Seite kaputtrechnen. Dass ein Preis zu
       niedrig sein könnte, wird hier bewusst NICHT geprüft — der
       Auftraggeber hat sich gegen Warnlogik entschieden. Bitte hier auch
       später keine Mindestlohn- oder Marktprüfung "nachrüsten", ohne das
       vorher abzustimmen. */
    if (!Number.isFinite(n) || n < 0 || n > 100_000) continue;

    await setRate(slug, f.key, n);
  }

  preiseAuffrischen();
  redirect(`/intern/preise?gespeichert=${slug}#${slug}`);
}

export async function resetPreise(formData: FormData) {
  const slug = String(formData.get("konfigurator") ?? "");
  if (!getConfigurator(slug)) return;

  await clearRates(slug);
  preiseAuffrischen();
  redirect(`/intern/preise?gespeichert=${slug}#${slug}`);
}
