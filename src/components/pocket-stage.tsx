"use client";

import { useState, type ReactNode } from "react";
import type { PocketView } from "@/lib/present";

const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.08'/></svg>`;
const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`;
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

const STAGES: Record<string, { src: string; bg: string; word: string }> = {
  "Bubblegum Chog": { src: "/figures/bubblegum.png", bg: "#F4845F", word: "SWEET" },
  "Laser Wizard": { src: "/figures/laser.png", bg: "#6BBF7A", word: "WILD" },
  "Little Crown": { src: "/figures/crown.png", bg: "#E882B4", word: "PROUD" },
  "Quiet One": { src: "/figures/quiet.png", bg: "#6EB5FF", word: "SOFT" },
};

const HUNGER: Record<string, { pct: number; label: string }> = {
  hungry: { pct: 18, label: "Empty" },
  sulking: { pct: 10, label: "Cold" },
  waiting: { pct: 46, label: "Restless" },
  nibbling: { pct: 62, label: "Tasting" },
  cozy: { pct: 76, label: "Content" },
  buzzing: { pct: 86, label: "Bright" },
  glowing: { pct: 94, label: "Full" },
  legendary: { pct: 100, label: "Stuffed" },
  unjarred: { pct: 8, label: "Waiting" },
};

const BURST = [
  { dx: "-36px", dy: "-110px", delay: "0ms" },
  { dx: "28px", dy: "-130px", delay: "80ms" },
  { dx: "64px", dy: "-80px", delay: "140ms" },
  { dx: "-8px", dy: "-150px", delay: "200ms" },
  { dx: "8px", dy: "-70px", delay: "40ms" },
];

export type HistoryItem = { id: number; title: string; detail: string };

export function PocketStage({
  view,
  banner,
  children,
  celebrate = 0,
  history = [],
}: {
  view: PocketView;
  banner?: ReactNode;
  children?: ReactNode;
  celebrate?: number;
  history?: HistoryItem[];
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const stage = STAGES[view.petName] ?? STAGES["Bubblegum Chog"];
  const showPhoto = Boolean(view.imageUrl) && failedUrl !== view.imageUrl;
  const hunger = HUNGER[view.moodId] ?? HUNGER.hungry;
  const src = showPhoto && view.imageUrl ? view.imageUrl : stage.src;

  return (
    <div>
      <section
        data-testid="pet-art"
        className="relative overflow-hidden"
        style={{
          background: stage.bg,
          minHeight: "min(78vh, 760px)",
          transition: `background-color 650ms ${EASE}`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{ opacity: 0.4, backgroundImage: GRAIN_URL, backgroundSize: "200px 200px" }}
        />
        <p
          aria-hidden="true"
          className="font-anton pointer-events-none absolute inset-x-0 top-[12%] z-[1] text-center text-white uppercase select-none"
          style={{
            fontFamily: "var(--font-anton), sans-serif",
            fontSize: "clamp(88px, 26vw, 320px)",
            lineHeight: 0.8,
          }}
        >
          {stage.word}
        </p>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-56 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-4 right-4 z-30">{banner}</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${view.petName}, the pocket pet`}
          className="absolute bottom-[28%] left-1/2 z-[2] h-[58%] w-auto max-w-[min(88vw,520px)] -translate-x-1/2 object-contain object-bottom sm:bottom-0 sm:h-[82%] sm:max-w-[min(92vw,640px)]"
          onError={() => {
            if (view.imageUrl) setFailedUrl(view.imageUrl);
          }}
        />
        <div
          data-testid="pet-scene"
          data-celebrate={celebrate > 0 ? "yes" : "no"}
          className="pointer-events-none absolute inset-0 z-20"
        >
          {celebrate > 0 ? (
            <div data-testid="celebration" className="absolute inset-0" aria-hidden="true">
              {BURST.map((coin) => (
                <span
                  key={coin.delay}
                  className="coin-burst absolute top-[42%] left-1/2 h-4 w-4 rounded-full bg-[#6FFF00] shadow-[0_0_16px_#6FFF00]"
                  style={{
                    ["--dx" as string]: coin.dx,
                    ["--dy" as string]: coin.dy,
                    animationDelay: coin.delay,
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
        <div
          className="absolute bottom-6 left-4 z-30 max-w-xl text-white sm:bottom-10 sm:left-10"
          data-testid="mood"
          data-mood={view.moodId}
          data-voice={view.voice}
        >
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase">Chog Pocket</p>
          <h1
            className="font-anton mt-1 text-5xl leading-[0.9] uppercase sm:text-7xl"
            data-testid="pet-name"
            style={{ fontFamily: "var(--font-anton), sans-serif" }}
          >
            {view.petName}
          </h1>
          <p className="font-condiment text-4xl text-white sm:text-5xl" data-testid="mood-title" style={{ fontFamily: "var(--font-condiment), cursive" }}>
            {view.moodTitle}
          </p>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90" data-testid="mood-line" aria-live="polite">
            {view.moodLine}
          </p>
          {view.tokenId !== null ? <p className="mt-2 text-xs tracking-wide uppercase">Token {view.tokenId}</p> : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-4 px-4 py-8 sm:px-8 lg:grid-cols-3">
        <article className="liquid-glass flex items-center gap-4 rounded-[32px] p-5">
          <div
            className="relative h-28 w-14 shrink-0 overflow-hidden rounded-t-xl rounded-b-[1.4rem] border border-white/30 bg-white/5"
            role="img"
            aria-label={view.savedLabel}
            data-testid="jar"
          >
            <div
              className="absolute inset-x-0 bottom-0 bg-[#6FFF00]"
              style={{ height: `${view.jarPercent}%`, transition: `height 650ms ${EASE}` }}
              data-testid="jar-fill"
            />
            <div className="absolute inset-x-2 top-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
          <div>
            <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/60 uppercase">{view.jarLabel}</p>
            <p className="font-anton text-3xl leading-none uppercase" data-testid="saved-amount" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              {view.savedLabel}
            </p>
            <p className="mt-1 text-sm text-[#EFF4FF]/70" data-testid="wallet-amount">
              {view.walletLabel}
            </p>
          </div>
        </article>
        <article className="liquid-glass rounded-[32px] p-5">
          <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/60 uppercase">Streak</p>
          <p className="font-anton mt-2 text-4xl leading-none uppercase" data-testid="streak-count" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {view.streakText}
          </p>
          <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <span
                key={index}
                className={`h-2.5 flex-1 rounded-full ${index < Math.min(view.streak, 7) ? "bg-[#6FFF00]" : "bg-white/15"}`}
              />
            ))}
          </div>
        </article>
        <article className="liquid-glass rounded-[32px] p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/60 uppercase">Hunger</p>
            <p className="font-anton text-sm uppercase text-[#6FFF00]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              {hunger.label}
            </p>
          </div>
          <p className="font-anton mt-2 text-4xl leading-none" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {hunger.pct}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div className="h-full bg-[#6FFF00]" style={{ width: `${hunger.pct}%`, transition: `width 650ms ${EASE}` }} />
          </div>
        </article>
      </section>

      {children ? (
        <section className="mx-auto max-w-[1180px] px-4 sm:px-8">
          <div className="liquid-glass space-y-4 rounded-[32px] p-5 sm:p-7">{children}</div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1180px] px-4 py-12 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-anton text-4xl uppercase sm:text-5xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            Traits
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-[#EFF4FF]/75" data-testid="personality">
            {view.personality}
          </p>
        </div>
        <ul data-testid="trait-list" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {view.traits.map((trait) => (
            <li key={trait.name} className="liquid-glass rounded-[28px] px-4 py-4 sm:px-5">
              <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">{trait.name}</p>
              <p className="font-anton mt-1 text-base leading-tight uppercase sm:text-2xl sm:leading-none" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                {trait.value}
              </p>
            </li>
          ))}
        </ul>
        {!showPhoto && view.imageUrl ? (
          <p className="mt-4 text-sm text-[#EFF4FF]/70">The picture did not load. The traits are still here.</p>
        ) : null}
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-8" data-testid="history">
        <h2 className="font-anton text-4xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          Jar history
        </h2>
        {history.length === 0 ? (
          <p className="mt-3 max-w-lg text-sm text-[#EFF4FF]/70">
            Nothing set aside yet. The first day is the one that starts the streak.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {history.map((item) => (
              <li key={item.id} className="liquid-glass flex flex-wrap items-baseline justify-between gap-2 rounded-[24px] px-5 py-4">
                <span className="font-anton uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                  {item.title}
                </span>
                <span className="text-sm text-[#EFF4FF]/65">{item.detail}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
