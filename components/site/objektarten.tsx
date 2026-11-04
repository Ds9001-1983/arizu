import {
  Building,
  Building2,
  GraduationCap,
  Shapes,
  Store,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* Objektarten der Geschäftskunden. Eine Quelle für /geschaeftskunden und die
   Startseite, damit beide dasselbe versprechen. Die Texte stammen von der
   Geschäftskundenseite (Kundengespräch 14.08.2026). */
const objektarten = [
  {
    icon: Building2,
    titel: "Bürogebäude",
    text: "Unterhaltsreinigung nach Ihrem Takt, auch außerhalb der Arbeitszeiten.",
  },
  {
    icon: Stethoscope,
    titel: "Praxen und Gesundheitseinrichtungen",
    text: "Erhöhte Anforderungen an Hygiene und Dokumentation, feste Kraft statt wechselndem Personal.",
  },
  {
    icon: Building,
    titel: "Wohnanlagen und Hausverwaltungen",
    text: "Treppenhaus, Außenanlagen, Mülltonnen und Winterdienst aus einer Hand — je Objekt abgerechnet.",
  },
  {
    icon: Store,
    titel: "Ladenlokale und Gastronomie",
    text: "Vor Öffnung oder nach Feierabend, damit der Betrieb nicht steht.",
  },
  {
    icon: GraduationCap,
    titel: "Bildung & öffentliche Einrichtungen",
    text: "Zuverlässige Reinigung und Betreuung für Schulen, Kitas, Verwaltungsgebäude und öffentliche Einrichtungen – abgestimmt auf Nutzung und Betriebszeiten.",
  },
  {
    icon: Shapes,
    titel: "Weitere Objekte",
    text: "Individuelle Dienstleistungen für Gewerbe-, Wohn- und Sonderobjekte – flexibel abgestimmt auf die jeweiligen Anforderungen.",
  },
];

export function ObjektartenGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2", className)}>
      {objektarten.map((o) => (
        <div key={o.titel} className="rounded-sm border border-mist bg-surface p-6">
          <o.icon className="size-6 text-gold-deep" aria-hidden />
          <h3 className="mt-4 font-display text-lg text-navy">{o.titel}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{o.text}</p>
        </div>
      ))}
    </div>
  );
}
