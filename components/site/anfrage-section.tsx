import { Container } from "./container";
import { LeadForm } from "./lead-form";
import { SectionHeading } from "./section-heading";

/**
 * Anfrage-Abschnitt. Die id ist der Sprungpunkt, auf den der Konfigurator
 * nach "Unverbindlich anfragen" scrollt.
 */
export function AnfrageSection({ defaultService }: { defaultService?: string }) {
  return (
    <section id="anfrage" className="scroll-mt-24 bg-shell py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionHeading
            eyebrow="Anfrage"
            title={
              <>
                Lassen Sie uns
                <br />
                gemeinsam anpacken.
              </>
            }
            lead="Schreiben Sie uns, was ansteht. Wir melden uns in der Regel noch am selben Werktag — die Besichtigung vor Ort ist kostenlos und unverbindlich."
          />
          <div className="rounded-sm border border-mist bg-surface p-6 sm:p-8">
            <LeadForm defaultService={defaultService} />
          </div>
        </div>
      </Container>
    </section>
  );
}
