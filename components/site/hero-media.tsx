"use client";

import { useEffect, useState } from "react";
import { AiMediaBadge } from "@/components/ai/ai-media-badge";

/* ==================================================================
   Hero-Hintergrund: Standbild serverseitig, Video nur wenn es sich lohnt.

   Der Ablauf ist bewusst so herum:
   1. Das Standbild steht sofort im HTML und ist das LCP-Element. Die Seite
      ist damit fertig, bevor auch nur ein Byte Video geladen wurde.
   2. Das Video legt sich erst darüber, wenn es abspielbereit ist, und blendet
      weich ein. Fällt es aus, bleibt das Standbild — kein schwarzes Loch.

   Das Video läuft auch auf dem Handy — dort aber in einer eigenen, deutlich
   leichteren Fassung (854 px breit, 0,19 MB statt 0,54 MB). Auf einem
   Handydisplay ist der Unterschied nicht zu sehen, im Datenvolumen schon.
   Ein <source media="…"> im <video> wäre der naheliegende Weg, funktioniert
   aber nicht: Browser werten das media-Attribut nur in <picture> aus, in
   <video> wird schlicht die erste Quelle genommen. Deshalb entscheidet hier
   JavaScript.

   Zwei Fälle, in denen gar kein Video geladen wird:
     * `prefers-reduced-motion` — Bewegtbild im Vollbild ist genau das, was
       Menschen mit vestibulären Beschwerden meiden wollen
     * `Save-Data` im Browser aktiviert — wer das setzt, hat es so gemeint

   Der KI-Hinweis liegt als DOM-Element über dem Video, nicht eingebrannt:
   bleibt bei jeder Pixeldichte scharf, ist per Playwright nachweisbar und
   wird von Screenreadern als Text gelesen (Art. 50 EU AI Act).
   ================================================================== */

type NetworkInformation = { saveData?: boolean };

export function HeroMedia({
  poster,
  posterMobile,
  video,
  videoMobile,
  alt,
  assetId,
}: {
  poster: string;
  posterMobile: string;
  video?: string;
  videoMobile?: string;
  alt: string;
  assetId: string;
}) {
  const [quelle, setQuelle] = useState<string | null>(null);
  const [bereit, setBereit] = useState(false);

  useEffect(() => {
    if (!video) return;

    const wenigerBewegung = window.matchMedia("(prefers-reduced-motion: reduce)");
    const schmal = window.matchMedia("(max-width: 767px)");
    const sparmodus =
      (navigator as Navigator & { connection?: NetworkInformation }).connection
        ?.saveData === true;

    const pruefen = () => {
      if (wenigerBewegung.matches || sparmodus) {
        setQuelle(null);
        return;
      }
      setQuelle(schmal.matches ? (videoMobile ?? video) : video);
    };

    pruefen();
    wenigerBewegung.addEventListener("change", pruefen);
    schmal.addEventListener("change", pruefen);
    return () => {
      wenigerBewegung.removeEventListener("change", pruefen);
      schmal.removeEventListener("change", pruefen);
    };
  }, [video, videoMobile]);

  return (
    <figure className="absolute inset-0 m-0 overflow-hidden">
      <picture>
        <source media="(max-width: 640px)" srcSet={posterMobile} />
        <img
          src={poster}
          alt={alt}
          width={1344}
          height={752}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </picture>

      {quelle && (
        <video
          key={quelle}
          src={quelle}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          tabIndex={-1}
          onCanPlay={() => setBereit(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            bereit ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Zwei Verläufe statt einer Deckfläche: Der senkrechte trägt die
          Buttons unten, der waagerechte die Textspalte links. Rechts bleibt
          das Gebäude bewusst offen — es ist das Verkaufsargument, eine
          gleichmäßige Abdunklung würde es zu Tapete machen. */}
      <div
        className="absolute inset-0 bg-linear-to-t from-navy/95 via-navy/45 to-navy/10"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-linear-to-r from-navy/85 via-navy/30 to-transparent"
        aria-hidden
      />

      <AiMediaBadge assetId={assetId} position="bottom-right" />
    </figure>
  );
}
