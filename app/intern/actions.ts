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
import { type LeadStatus, updateLead } from "@/lib/db";

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

export async function saveLead(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  const statusRaw = String(formData.get("status") ?? "");
  const status = STATUS.includes(statusRaw as LeadStatus)
    ? (statusRaw as LeadStatus)
    : undefined;

  await updateLead(id, {
    name: String(formData.get("name") ?? "") || undefined,
    phone: String(formData.get("phone") ?? "") || undefined,
    email: String(formData.get("email") ?? "") || undefined,
    objekt: String(formData.get("objekt") ?? "") || undefined,
    // Das Feld, das Arian beim Kunden korrigiert: „sind doch 74 m², nicht 60".
    konfigurator: String(formData.get("konfigurator") ?? "") || undefined,
    note: String(formData.get("note") ?? "") || undefined,
    status,
  });

  revalidatePath("/intern");
  revalidatePath(`/intern/${id}`);
  redirect(`/intern/${id}?gespeichert=1`);
}
