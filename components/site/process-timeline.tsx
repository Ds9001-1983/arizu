import { Container } from "./container";
import { SectionHeading } from "./section-heading";

const steps = [
  "Kontaktaufnahme",
  "Kostenloser Vor-Ort-Termin",
  "Transparentes Angebot",
  "Professionelle Durchführung",
];

/** Statischer Ablauf ohne Client-JavaScript. */
export function ProcessTimeline() {
  return (
    <section className="bg-surface py-20 sm:py-24" aria-labelledby="ablauf-titel">
      <Container>
        <div id="ablauf-titel">
          <SectionHeading
            eyebrow="So läuft es ab"
            title="In vier Schritten zu Ihrer Lösung"
          />
        </div>

        <ol
          className="relative mt-12 grid gap-8 before:absolute before:top-5 before:bottom-5 before:left-5 before:w-px before:bg-mist sm:grid-cols-4 sm:gap-6 sm:before:top-5 sm:before:right-[12.5%] sm:before:bottom-auto sm:before:left-[12.5%] sm:before:h-px sm:before:w-auto"
          aria-labelledby="ablauf-titel"
        >
          {steps.map((step, index) => (
            <li key={step} className="relative pl-14 sm:pt-14 sm:pl-0 sm:text-center">
              <span
                className="absolute top-0 left-0 z-10 flex size-10 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-gold sm:left-1/2 sm:-translate-x-1/2"
                aria-hidden
              >
                {index + 1}
              </span>
              <h3 className="pt-2 font-display text-base text-navy sm:pt-0">
                {step}
              </h3>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
