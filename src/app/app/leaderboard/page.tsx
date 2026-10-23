"use client";

import { useEffect, useState } from "react";
import { PageFrame, PageHero } from "@/components/app/page-hero";

type Pocket = { owner: string; tokenId: number; saved: string; fed: string; streak: number; feeds: number; lastDay: number };
type Stats = { live: boolean; block?: string; totalFed?: string; jarBalance?: string; feeders?: number; feeds?: number; pockets?: Pocket[] };
type Score = { player: string; label: string; game: string; score: number; at: number };

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const whole = (v: string) => Math.floor(Number(v)).toLocaleString("en-US");
const heading = { fontFamily: "var(--font-anton), sans-serif" };

function Section({ title, testid, children }: { title: string; testid: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5" data-testid={testid}>
      <h2 className="font-anton text-2xl uppercase" style={heading}>{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-[#EFF4FF]/70">{text}</p>;
}

export default function LeaderboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [scores, setScores] = useState<{ live: boolean; entries: Score[] } | null>(null);

  useEffect(() => {
    let on = true;
    const load = () => {
      fetch("/api/stats", { cache: "no-store" }).then((r) => r.json()).then((s) => on && setStats(s)).catch(() => on && setStats({ live: false }));
      fetch("/api/scores", { cache: "no-store" }).then((r) => r.json()).then((s) => on && setScores(s)).catch(() => on && setScores({ live: false, entries: [] }));
    };
    load();
    const t = setInterval(load, 30_000);
    return () => { on = false; clearInterval(t); };
  }, []);

  const pockets = stats?.pockets ?? [];
  const byStreak = [...pockets].sort((a, b) => b.streak - a.streak).slice(0, 10);
  const byJar = [...pockets].sort((a, b) => Number(b.saved) - Number(a.saved)).slice(0, 10);
  const top = scores?.entries.slice(0, 15) ?? [];

  return (
    <PageFrame>
      <PageHero
        petName="Chog"
        word="Board"
        kicker="Leaderboard"
        title="Who is keeping their Chog fed"
        lede="Streaks and jars come straight from the jar contract on Monad. Arcade scores are saved on our server. Nothing here is made up."
      />
      <div className="mt-6 grid gap-4 md:grid-cols-3" data-testid="board-totals">
        {[
          ["Saved in the jar", stats?.live ? `${whole(stats.jarBalance ?? "0")} $CHOG` : "—"],
          ["Feeders", stats?.live ? String(stats.feeders ?? 0) : "—"],
          ["Feeds on-chain", stats?.live ? String(stats.feeds ?? 0) : "—"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase text-[#EFF4FF]/60">{k}</p>
            <p className="font-anton text-3xl text-[#6FFF00]" style={heading}>{stats ? v : "…"}</p>
          </div>
        ))}
      </div>
      {stats && !stats.live ? <p className="mt-3 text-sm text-[#FF8EE4]">Monad RPC did not answer. Retrying every 30 seconds.</p> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Section title="Longest streaks" testid="board-streak">
          {!stats ? <Empty text="Reading the chain…" /> : byStreak.length === 0 ? <Empty text="No one has fed the jar yet. Be the first." /> : (
            <ol>{byStreak.map((p) => (
              <li key={p.owner} className="flex justify-between border-t border-white/10 py-2 first:border-t-0">
                <span>Chog #{p.tokenId} · {short(p.owner)}</span><span className="font-anton text-[#6FFF00]">{p.streak}d</span>
              </li>))}</ol>)}
        </Section>
        <Section title="Biggest jars" testid="board-jar">
          {!stats ? <Empty text="Reading the chain…" /> : byJar.length === 0 ? <Empty text="No $CHOG saved yet. Be the first." /> : (
            <ol>{byJar.map((p) => (
              <li key={p.owner} className="flex justify-between border-t border-white/10 py-2 first:border-t-0">
                <span>Chog #{p.tokenId} · {short(p.owner)}</span><span className="font-anton text-[#6FFF00]">{whole(p.saved)} $CHOG</span>
              </li>))}</ol>)}
        </Section>
        <Section title="Arcade high scores" testid="board-arcade">
          {!scores ? <Empty text="Loading scores…" /> : top.length === 0 ? <Empty text="No scores yet. Play a game and be the first." /> : (
            <ol>{top.map((s) => (
              <li key={`${s.player}-${s.game}`} className="flex justify-between border-t border-white/10 py-2 first:border-t-0">
                <span>{s.label} · {s.game}</span><span className="font-anton text-[#6FFF00]">{s.score.toLocaleString("en-US")}</span>
              </li>))}</ol>)}
        </Section>
      </div>
      {stats?.block ? <p className="mt-4 text-xs text-[#EFF4FF]/50">Read at Monad block {stats.block}.</p> : null}
    </PageFrame>
  );
}
