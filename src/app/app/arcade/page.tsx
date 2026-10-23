"use client";

import Link from "next/link";
import { PageFrame, PageHero } from "@/components/app/page-hero";
import { usePocket } from "@/components/app/use-pocket";
import { ARCADE_GAMES } from "@/lib/arcade";

export default function ArcadePage() {
  const { demo, pet } = usePocket();

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  return (
    <PageFrame>
      <PageHero
        petName={pet.name}
        imageUrl={pet.imageUrl}
        word="SIX"
        kicker="six games"
        title="Arcade"
        lede="Open-source games, rebranded for this Chog. Scores land on the pet’s mood, streak, and the leaderboard. A Chog Genesis in the wallet doubles them."
      />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="arcade-list">
        {ARCADE_GAMES.map((game) => (
          <article key={game.id} className="liquid-glass flex flex-col rounded-[var(--radius-24)] p-4">
            <div className="flex h-36 items-end justify-center rounded-[var(--radius-18)] bg-[#121a3d]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={game.figure} alt="" className="h-32 w-auto object-contain" />
            </div>
            <p className="mt-4 text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">{game.licence}</p>
            <h2 className="font-anton mt-1 text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              {game.name}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[#EFF4FF]/75">{game.blurb}</p>
            <p className="mt-2 text-xs text-[#EFF4FF]/50">{game.credit}</p>
            <Link
              href={`/app/arcade/${game.id}`}
              className="font-anton mt-4 inline-flex h-[var(--control)] items-center justify-center rounded-full bg-[#6FFF00] px-4 uppercase text-[#010828]"
            >
              Play {game.name}
            </Link>
          </article>
        ))}
      </section>
    </PageFrame>
  );
}
