"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { ART } from "@/components/arcade/sprites";
import { getMuted, playSfx, setMuted, subscribeMuted, unlockAudio } from "@/lib/arcade-sfx";
import { setPlayChrome } from "@/lib/play-chrome";

export function GameShell({
  id,
  title,
  credit,
  score,
  acted,
  live,
  hint,
  over,
  boost,
  swing = "center",
  square = false,
  onStart,
  children,
}: {
  id: string;
  title: string;
  credit: string;
  score: number;
  acted: boolean;
  live: boolean;
  hint: string;
  over: boolean;
  boost: boolean;
  swing?: "center" | "wide";
  square?: boolean;
  onStart: () => void;
  children: ReactNode;
}) {
  const muted = useSyncExternalStore(subscribeMuted, getMuted, () => false);
  const landed = boost ? score * 2 : score;

  useEffect(() => {
    setPlayChrome({ playing: live || over, title, score });
  }, [live, over, title, score]);

  useEffect(() => {
    return () => setPlayChrome({ playing: false, title: "", score: 0 });
  }, []);

  function share() {
    const url = new URL("https://x.com/intent/tweet");
    url.searchParams.set("text", `${title} · ${landed} points landed on your Chog`);
    url.searchParams.set("url", window.location.href);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  return (
    <div data-testid={`game-${id}`} data-acted={acted ? "1" : "0"} data-live={live ? "1" : "0"} data-swing={swing}>
      <div className={`flex flex-col ${square ? "max-lg:min-h-[calc(100dvh-10rem)]" : ""}`}>
        <div className="liquid-glass flex flex-col rounded-[var(--radius-24)] p-2 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">{title}</p>
          <p
            key={score}
            className={`font-anton text-3xl uppercase sm:text-4xl ${score > 0 ? "score-blink" : ""}`}
            data-testid={`game-${id}-score`}
            style={{ fontFamily: "var(--font-anton), sans-serif" }}
          >
            {score}
          </p>
        </div>
        <button
          type="button"
          data-testid="game-mute"
          aria-pressed={muted}
          className="font-anton h-[var(--control)] rounded-full border border-white/15 px-4 text-xs uppercase text-[#EFF4FF]"
          onClick={() => {
            unlockAudio();
            setMuted(!muted);
          }}
        >
          {muted ? "Sound off" : "Sound on"}
        </button>
      </div>
      <div
        className={
          square
            ? "relative mt-3 w-full"
            : "relative mt-2 w-full overflow-hidden rounded-[var(--radius-18)] bg-[#071033] max-lg:h-[max(70dvh,calc(100dvh-13.5rem))] lg:aspect-[16/10]"
        }
      >
        {children}
        {!live && !over ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#010828]/78 px-6 text-center">
            <p className="max-w-sm text-sm leading-relaxed text-[#EFF4FF]/85">{hint}</p>
            <button
              type="button"
              data-testid={`game-${id}-start`}
              className="font-anton h-[var(--control)] rounded-full bg-[#6FFF00] px-8 uppercase text-[#010828]"
              onClick={() => {
                unlockAudio();
                playSfx("score");
                onStart();
              }}
            >
              Start
            </button>
          </div>
        ) : null}
        {over ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-start gap-2 bg-[#010828]/72 px-4 pt-4 text-center sm:pt-8"
            data-testid={`game-${id}-over`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ART.reveal} alt="" className="arcade-rise h-24 w-auto sm:h-28" />
            <p className="font-anton text-5xl text-[#6FFF00]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              {landed}
            </p>
            <p className="text-sm text-[#EFF4FF]">{landed} points landed on your Chog</p>
            {boost ? (
              <p className="font-anton text-xl text-[#F5B942]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                x2
              </p>
            ) : null}
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                className="font-anton h-[var(--control)] rounded-full bg-[#6FFF00] px-5 uppercase text-[#010828]"
                onClick={share}
              >
                Share on X
              </button>
              <button
                type="button"
                data-testid={`game-${id}-again`}
                className="font-anton h-[var(--control)] rounded-full border border-white/20 px-5 uppercase text-[#EFF4FF]"
                onClick={() => {
                  unlockAudio();
                  onStart();
                }}
              >
                Play again
              </button>
            </div>
          </div>
        ) : null}
      </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#EFF4FF]/55 lg:mt-2">{credit}</p>
    </div>
  );
}
