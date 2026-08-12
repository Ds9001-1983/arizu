import { Plus } from "lucide-react";
import type { Faq } from "@/lib/services";

/**
 * FAQ als natives <details>/<summary>.
 *
 * Kostet null JavaScript (hilft dem Budget von 150 KB Initial-JS), ist
 * standardmäßig tastaturbedienbar und wird von Screenreadern korrekt als
 * aufklappbar angesagt. Ein Accordion aus einer UI-Bibliothek könnte hier
 * nichts, was das nicht auch kann.
 */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-mist border-y border-mist">
      {faqs.map((f) => (
        <details key={f.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-[1.05rem] font-semibold text-navy [&::-webkit-details-marker]:hidden">
            {f.question}
            <Plus
              className="mt-1 size-5 shrink-0 text-gold transition-transform duration-200 group-open:rotate-45"
              aria-hidden
            />
          </summary>
          <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-ink-muted">
            {f.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
