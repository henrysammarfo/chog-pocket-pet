"use client";

import { PageFrame, PageHero } from "@/components/app/page-hero";
import { usePocket } from "@/components/app/use-pocket";
import { wholeChog } from "@/lib/format";
import { buildBoard, type BoardRow } from "@/lib/leaderboard";
import { shareTokenNumber } from "@/lib/share-card";

function Row({ row, hint }: { row: BoardRow; hint: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-t border-white/10 py-3 first:border-t-0">
      <div>
        <p className="font-anton text-lg uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          {row.name}
        </p>
        <p className="text-xs text-[#EFF4FF]/60">{hint}</p>
      </div>
      <p className="text-right text-sm">
        <span className="block font-anton text-[#6FFF00]">{row.streak}d</span>
        <span className="text-[#EFF4FF]/70">{wholeChog(row.jar)}</span>
      </p>
    </li>
  );
}

export default function LeaderboardPage() {
  const { demo, pet, memory, today } = usePocket();

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  const extra: BoardRow[] =
    memory.streak > 0 || BigInt(memory.jarTotal) > 0n || (memory.arcadeTotal ?? 0) > 0
      ? [
          {
            tokenId: shareTokenNumber(pet.id, pet.tokenId),
            name: pet.tokenId != null ? `Chog #${pet.tokenId}` : pet.name,
            streak: memory.streak,
            jar: BigInt(memory.jarTotal),
            lastFeedDay: demo.state.lastFeedDay || today,
            arcade: memory.arcadeTotal ?? 0,
          },
        ]
      : [];
  const board = buildBoard(today, extra);
  const mine = extra[0];
  const arcadeRows =
    mine && !board.arcade.some((row) => row.tokenId === mine.tokenId) ? [...board.arcade, mine] : board.arcade;

  return (
    <PageFrame>
      <PageHero
        petName={pet.name}
        imageUrl={pet.imageUrl}
        word="RANK"
        kicker="who kept the habit"
        title="Leaderboard"
        lede="Longest streaks, fullest jars, and the Chogs that miss tomorrow if today stays quiet. The board mixes the demo field with the Chog on this phone."
      />
      <section className="grid items-start gap-4 lg:grid-cols-3">
        <article className="liquid-glass rounded-[var(--radius-24)] p-6" data-testid="board-streak">
          <h2 className="font-anton text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            Longest streak
          </h2>
          <ol className="mt-3">
            {board.longest.map((row) => (
              <Row key={row.tokenId} row={row} hint={`${row.streak} mornings in a row`} />
            ))}
          </ol>
        </article>
        <article className="liquid-glass rounded-[var(--radius-24)] p-6" data-testid="board-jar">
          <h2 className="font-anton text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            Biggest jar
          </h2>
          <ol className="mt-3">
            {board.biggest.map((row) => (
              <Row key={row.tokenId} row={row} hint="Set aside in this Chog's name" />
            ))}
          </ol>
        </article>
        <article className="liquid-glass rounded-[var(--radius-24)] p-6" data-testid="board-risk">
          <h2 className="font-anton text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            About to break
          </h2>
          <p className="mt-2 text-sm text-[#EFF4FF]/70">Set aside yesterday, not yet today. One quiet morning ends the run.</p>
          <ol className="mt-3">
            {board.atRisk.map((row) => (
              <Row key={row.tokenId} row={row} hint="Needs a set-aside today" />
            ))}
          </ol>
        </article>
      </section>
      <article className="liquid-glass rounded-[var(--radius-24)] p-6" data-testid="board-arcade">
        <h2 className="font-anton text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          Arcade scores
        </h2>
        <p className="mt-2 text-sm text-[#EFF4FF]/70">Points from the six games, kept on the Chog.</p>
        <ol className="mt-3">
          {arcadeRows.map((row) => (
            <li key={row.tokenId} className="flex items-center justify-between gap-3 border-t border-white/10 py-3 first:border-t-0">
              <p className="font-anton text-lg uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                {row.name}
              </p>
              <p className="font-anton text-[#6FFF00]">{row.arcade ?? 0}</p>
            </li>
          ))}
        </ol>
      </article>
    </PageFrame>
  );
}
