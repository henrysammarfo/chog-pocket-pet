"use client";

import Link from "next/link";
import { useState } from "react";
import { FeedButton } from "@/components/app/feed-button";
import { GenesisPet } from "@/components/app/genesis-pet";
import { TodayStage } from "@/components/app/today-stage";
import { usePocket } from "@/components/app/use-pocket";
import { demoDateLabel } from "@/lib/streak";

const neon =
  "font-anton inline-flex h-14 w-full items-center justify-center rounded-full bg-[#6FFF00] px-6 text-base uppercase text-[#010828] hover:bg-[#8dff33] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-[#EFF4FF]/50";

export default function TodayPage() {
  const { demo, view, feed, nowSec, pet } = usePocket();
  const [celebrate, setCelebrate] = useState(false);

  if (!demo.ready) {
    return (
      <p className="p-6 font-anton text-2xl uppercase" data-testid="pocket-loading">
        Opening the pocket…
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-4 px-4 py-4 sm:py-8">
      <TodayStage
        view={view}
        celebrate={celebrate}
        banner={
          <div className="flex flex-col items-end gap-2">
            <span data-testid="demo-badge" className="rounded-full bg-[#6FFF00] px-3 py-1 font-anton text-[11px] tracking-[0.16em] text-[#010828] uppercase">
              {view.sample ? "Demo" : "Your Chog"}
            </span>
            {demo.clock !== null ? (
              <p className="rounded-full bg-black/35 px-3 py-1 text-xs text-white" data-testid="demo-date">
                {demo.speed === "minute" ? "Demo clock" : "Demo date"}: {demoDateLabel(nowSec)}
              </p>
            ) : null}
          </div>
        }
      />
      <GenesisPet />
      <section className="liquid-glass rounded-[var(--radius-24)] p-4 sm:p-6">
        <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Today&apos;s action</p>
        <FeedButton
          label={view.feedLabel}
          disabled={view.feedDisabled}
          className={neon}
          pet={pet}
          amount={demo.state.goal}
          onDemo={() => feed()}
          onDone={() => setCelebrate(true)}
        />
        {view.feedHint ? (
          <p className="mt-3 text-center text-sm text-[#EFF4FF]/70" data-testid="feed-hint">
            {view.feedHint}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/app/jar" className="text-[#6FFF00] underline-offset-4 hover:underline">
            Open the jar
          </Link>
          <Link href="/connect" data-testid="use-wallet" className="font-anton uppercase text-[#EFF4FF]/80">
            Use my Chog
          </Link>
        </div>
      </section>
      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <Link href="/app/jar" className="rounded-[var(--radius-18)] border border-white/15 bg-white/[0.03] p-3 sm:p-4">
          <p className="text-[10px] tracking-[0.14em] text-[#EFF4FF]/50 uppercase">Jar</p>
          <p className="font-anton mt-1 text-sm leading-snug uppercase sm:text-xl" data-testid="saved-amount" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {view.savedLabel}
          </p>
        </Link>
        <Link href="/app/streak" className="rounded-[var(--radius-18)] border border-white/15 bg-white/[0.03] p-3 sm:p-4">
          <p className="text-[10px] tracking-[0.14em] text-[#EFF4FF]/50 uppercase">Streak</p>
          <p className="font-anton mt-1 text-sm leading-snug uppercase sm:text-xl" data-testid="streak-count" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {view.streakText}
          </p>
        </Link>
        <Link href="/app/settings" className="rounded-[var(--radius-18)] border border-white/15 bg-white/[0.03] p-3 sm:p-4">
          <p className="text-[10px] tracking-[0.14em] text-[#EFF4FF]/50 uppercase">In hand</p>
          <p className="font-anton mt-1 text-sm leading-snug uppercase sm:text-xl" data-testid="wallet-amount" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {view.walletLabel}
          </p>
        </Link>
      </section>
    </div>
  );
}
