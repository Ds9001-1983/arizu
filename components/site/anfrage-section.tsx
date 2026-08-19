import { Container } from "./container";
import { LeadForm, type KundenartModus } from "./lead-form";
import { SectionHeading } from "./section-heading";

/**
 * Anfrage-Abschnitt. Die id ist der Sprungpunkt, auf den der Konfigurator
 * nach "Unverbindliche Anfrage stellen" scrollt.
 */
export function AnfrageSection({
  defaultService,
  kundenart = "privat",
}: {
  defaultService?: string;
  kundenart?: KundenartModus;
}) {
  return (
    <section id="anfrage" className="scroll-mt-24 bg-shell py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Anfrage"
              title="Wir kümmern uns um Ihr Anliegen."
              lead="Ob einzelne Dienstleistung oder umfassende Betreuung – schildern Sie uns kurz, was Sie benötigen. Wir melden uns in der Regel noch am selben Werktag bei Ihnen und besprechen gemeinsam die nächsten Schritte."
            />
            <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-ink-muted">
              Die Besichtigung vor Ort ist kostenlos und unverbindlich.
            </p>
          </div>
          <div className="rounded-sm border border-mist bg-surface p-6 sm:p-8">
            <LeadForm defaultService={defaultService} kundenart={kundenart} />
          </div>
        </div>
      </Container>
    </section>
  );
}
