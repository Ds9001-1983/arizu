import { AlertTriangle } from "lucide-react";
import { Container } from "./container";

/**
 * Rahmen für Rechtstexte.
 *
 * `todo` erzeugt oben einen auffälligen Hinweis. Absicht: Solange
 * Pflichtangaben fehlen oder ein Text nur ein Entwurf ist, soll das niemandem
 * durchgehen — weder Dennis beim Durchklicken noch Arian, wenn er die Seite
 * freigibt. Vor dem Live-Gang müssen alle diese Kästen weg sein.
 */
export function LegalLayout({
  title,
  updated,
  todo,
  children,
}: {
  title: string;
  updated?: string;
  todo?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-14 sm:py-20">
      <Container>
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl text-navy sm:text-4xl">{title}</h1>
          {updated && (
            <p className="mt-3 text-sm text-ink-muted">Stand: {updated}</p>
          )}

          {todo && (
            <div className="mt-8 flex gap-3.5 rounded-sm border-2 border-red-400 bg-red-50 p-5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-700" aria-hidden />
              <div>
                <p className="font-display text-sm font-bold uppercase tracking-[0.1em] text-red-800">
                  Nicht veröffentlichungsreif
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-red-900">{todo}</p>
              </div>
            </div>
          )}

          <div className="legal mt-10">{children}</div>
        </div>
      </Container>
    </div>
  );
}

/** Fehlende Angabe sichtbar machen, statt sie stillschweigend leer zu lassen. */
export function Fehlt({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded-xs bg-red-200 px-1.5 py-0.5 font-semibold text-red-900">
      [ergänzen: {children}]
    </mark>
  );
}
