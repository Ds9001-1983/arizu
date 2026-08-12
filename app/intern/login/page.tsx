import type { Metadata } from "next";
import { LogoWordmark } from "@/components/site/logo";
import { login } from "../actions";

export const metadata: Metadata = {
  title: "Interner Bereich",
  robots: { index: false, follow: false },
};

const messages: Record<string, string> = {
  falsch: "Passwort stimmt nicht.",
  gesperrt: "Zu viele Fehlversuche. Bitte in einigen Minuten erneut versuchen.",
  "nicht-eingerichtet":
    "Der interne Bereich ist noch nicht eingerichtet (ARIZU_ADMIN_PASSWORD_HASH und SESSION_SECRET fehlen).",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { fehler } = await searchParams;
  const message = fehler ? messages[fehler] : undefined;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <LogoWordmark className="mx-auto h-9 w-auto" />
        <h1 className="mt-8 text-center font-display text-xl text-navy">
          Interner Bereich
        </h1>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Anfragen ansehen und bearbeiten.
        </p>

        <form action={login} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-semibold text-navy"
            >
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-sm border border-mist bg-surface px-4 py-3 text-navy focus:border-gold focus:outline-none"
            />
          </div>

          {message && (
            <p className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-sm bg-navy px-5 py-3.5 font-display text-sm font-bold text-white transition-colors hover:bg-navy-band"
          >
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}
