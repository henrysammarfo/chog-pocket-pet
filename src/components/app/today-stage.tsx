"use client";

import type { ReactNode } from "react";
import type { PocketView } from "@/lib/present";

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.08'/></svg>")}")`;

const STAGES: Record<string, { src: string; bg: string; word: string }> = {
  "Bubblegum Chog": { src: "/figures/bubblegum.png", bg: "#F4845F", word: "SWEET" },
  "Laser Wizard": { src: "/figures/laser.png", bg: "#6BBF7A", word: "WILD" },
  "Little Crown": { src: "/figures/crown.png", bg: "#E882B4", word: "PROUD" },
  "Quiet One": { src: "/figures/quiet.png", bg: "#6EB5FF", word: "SOFT" },
};

const BURST = [
  { dx: "-36px", dy: "-90px", delay: "0ms" },
  { dx: "28px", dy: "-110px", delay: "80ms" },
  { dx: "64px", dy: "-70px", delay: "140ms" },
  { dx: "-8px", dy: "-120px", delay: "200ms" },
];

export function TodayStage({
  view,
  celebrate,
  banner,
}: {
  view: PocketView;
  celebrate: boolean;
  banner?: ReactNode;
}) {
  const stage = STAGES[view.petName] ?? { src: view.imageUrl ?? "/figures/bubblegum.png", bg: "#F4845F", word: "CHOG" };
  const src = view.imageUrl ?? stage.src;

  return (
    <section
      data-testid="pet-art"
      className="relative overflow-hidden rounded-[var(--radius-24)]"
      style={{ background: stage.bg, minHeight: "min(58vh, 520px)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundImage: GRAIN, backgroundSize: "200px 200px" }}
      />
      <p
        aria-hidden="true"
        className="font-anton pointer-events-none absolute inset-x-0 top-[8%] text-center text-white uppercase"
        style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: "clamp(64px, 18vw, 200px)", lineHeight: 0.8 }}
      >
        {stage.word}
      </p>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute top-4 right-4 z-30">{banner}</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${view.petName}, the pocket pet`}
        className="absolute bottom-[18%] left-1/2 z-[2] h-[62%] w-auto max-w-[min(80%,420px)] -translate-x-1/2 object-contain object-bottom"
      />
      <div data-testid="pet-scene" data-celebrate={celebrate ? "yes" : "no"} className="pointer-events-none absolute inset-0 z-20">
        {celebrate ? (
          <div data-testid="celebration" className="absolute inset-0" aria-hidden="true">
            {BURST.map((coin) => (
              <span
                key={coin.delay}
                className="coin-burst absolute top-[40%] left-1/2 h-4 w-4 rounded-full bg-[#6FFF00]"
                style={{ ["--dx" as string]: coin.dx, ["--dy" as string]: coin.dy, animationDelay: coin.delay }}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div
        className="absolute right-4 bottom-4 left-4 z-30 text-white sm:right-auto sm:max-w-md"
        data-testid="mood"
        data-mood={view.moodId}
        data-voice={view.voice}
      >
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase">Today</p>
        <h1 className="font-anton mt-1 text-4xl leading-[0.9] uppercase sm:text-6xl" data-testid="pet-name" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          {view.petName}
        </h1>
        <p className="font-condiment text-3xl sm:text-4xl" data-testid="mood-title" style={{ fontFamily: "var(--font-condiment), cursive" }}>
          {view.moodTitle}
        </p>
        <p className="mt-1 max-w-md text-sm leading-snug text-white/90" data-testid="mood-line">
          {view.moodLine}
        </p>
      </div>
    </section>
  );
}
