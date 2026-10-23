"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useAccount } from "wagmi";
import { submitScore } from "@/lib/score-submit";
import { Coin2048Game } from "@/components/arcade/coin2048-game";
import { DashGame } from "@/components/arcade/dash-game";
import { FloppyGame } from "@/components/arcade/floppy-game";
import { HuntGame } from "@/components/arcade/hunt-game";
import { StackGame } from "@/components/arcade/stack-game";
import { TowerGame } from "@/components/arcade/tower-game";
import { PageFrame } from "@/components/app/page-hero";
import { usePocket } from "@/components/app/use-pocket";
import { useWalletChogs } from "@/components/app/use-wallet-chogs";
import { arcadeAccess, arcadeGame } from "@/lib/arcade";
import { recordArcadeScore } from "@/lib/memory-store";
import type { PetMemory } from "@/lib/memory";

export function ArcadePlay({ id }: { id: string }) {
  const game = arcadeGame(id);
  const { demo, pet, memory, today } = usePocket();
  const wallet = useWalletChogs();
  const [banked, setBanked] = useState<PetMemory | null>(null);
  const sent = useRef(0);
  const { address } = useAccount();

  if (!game) {
    return (
      <PageFrame>
        <p className="font-anton text-3xl uppercase" data-testid="arcade-missing">
          That game is not in the arcade.
        </p>
        <Link href="/app/arcade" className="mt-4 inline-block text-[#6FFF00]">
          Back to the arcade
        </Link>
      </PageFrame>
    );
  }

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  const holds = Boolean(wallet.held.data && wallet.held.data > 0n);
  const access = arcadeAccess(true, holds);
  const current = game;
  const figure = pet.imageUrl || game.figure;

  function bank(total: number) {
    const delta = total >= sent.current ? total - sent.current : total;
    sent.current = total;
    if (delta <= 0) return;
    const next = recordArcadeScore(memory, {
      gameId: current.id,
      raw: delta,
      shown: total,
      boost: access.boost,
      day: today,
      at: Date.now(),
    });
    setBanked(next);
    submitScore(current.id, total, address, pet.name);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 px-3 pt-1 pb-6 lg:gap-4 lg:px-4 lg:py-6">
      <header className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={figure} alt="" className="h-12 w-12 rounded-[var(--radius-12)] object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-condiment text-2xl leading-none text-[#6FFF00]" style={{ fontFamily: "var(--font-condiment), cursive" }}>
            {game.kicker}
          </p>
          <h1 className="font-anton text-[1.65rem] uppercase leading-[0.9] sm:text-4xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {game.name}
          </h1>
        </div>
        <Link href="/app/arcade" className="shrink-0 text-sm text-[#6FFF00]">
          All six games
        </Link>
      </header>
      <p className="text-sm leading-tight text-white/90" data-testid="arcade-access">
        {access.boost
          ? "Chog Genesis is in this wallet. The score that reaches the pet is doubled."
          : "The score lands on this Chog. A Chog Genesis in the wallet doubles it."}
      </p>
      {game.id === "stack" ? <StackGame figure={figure} boost={access.boost} onScore={bank} /> : null}
      {game.id === "tower" ? <TowerGame figure={figure} boost={access.boost} onScore={bank} /> : null}
      {game.id === "dash" ? <DashGame figure={figure} boost={access.boost} onScore={bank} /> : null}
      {game.id === "floppy" ? <FloppyGame figure={figure} boost={access.boost} onScore={bank} /> : null}
      {game.id === "coin2048" ? <Coin2048Game figure={figure} boost={access.boost} onScore={bank} /> : null}
      {game.id === "snack" ? <HuntGame figure={figure} boost={access.boost} onScore={bank} /> : null}
      {banked ? (
        <p className="text-sm text-[#EFF4FF]/80" data-testid="arcade-banked">
          {banked.moodHistory[0]?.title}. Streak on this Chog: {banked.streak}. Arcade points: {banked.arcadeTotal ?? 0}.
        </p>
      ) : (
        <p className="text-sm text-[#EFF4FF]/60">A score above zero feeds this Chog’s mood, streak, and the leaderboard.</p>
      )}
    </div>
  );
}
