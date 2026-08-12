import { Leaf, ShieldCheck, Users } from "lucide-react";
import { Container } from "./container";

/* Die drei Merkmale stehen so im Designentwurf — Wortlaut unverändert
   übernommen, damit Flyer und Website dasselbe versprechen. */
const marks = [
  { icon: Users, title: "Kompetent", text: "Erfahrenes Team" },
  { icon: ShieldCheck, title: "Zuverlässig", text: "Pünktlich & vertrauensvoll" },
  { icon: Leaf, title: "Nachhaltig", text: "Umweltbewusst handeln" },
];

export function TrustBar() {
  return (
    <section className="bg-navy-band text-white" aria-label="Unsere Merkmale">
      <Container>
        <ul className="grid divide-y divide-white/12 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {marks.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex items-center gap-4 py-6 sm:justify-center sm:px-6"
            >
              <Icon className="size-7 shrink-0 text-gold" strokeWidth={1.5} aria-hidden />
              <div>
                <p className="font-display text-sm font-bold uppercase tracking-[0.12em] text-gold">
                  {title}
                </p>
                <p className="text-sm text-white/75">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
