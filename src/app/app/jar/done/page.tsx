"use client";

import Link from "next/link";
import { JarMark } from "@/components/app/jar-mark";
import { PageFrame, PageHero } from "@/components/app/page-hero";
import { usePocket } from "@/components/app/use-pocket";
import { wholeChog } from "@/lib/format";
import { jarFill } from "@/lib/savings";

export default function JarDonePage() {
  const { demo, pet, view, history, tier } = usePocket();
  const receipt = history.receipt;

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  const before = receipt?.before ? BigInt(receipt.before) : demo.state.saved;
  const after = receipt?.after ? BigInt(receipt.after) : demo.state.saved;
  const from = jarFill(before, demo.state.goal);
  const to = jarFill(after, demo.state.goal);
  const returning = receipt?.kind === "back";

  return (
    <PageFrame>
      <PageHero
        petName={pet.name}
        imageUrl={pet.imageUrl}
        word={receipt ? (returning ? "BACK" : "IN") : "JAR"}
        kicker={returning ? "back in hand" : "in the jar"}
        title={receipt ? "Done" : "Nothing just happened"}
        lede={receipt ? receipt.detail : "Set $CHOG aside from the jar, or take some back, and the result lands here."}
        aside={<JarMark percent={to} fromPercent={from} label={view.savedLabel} skin={tier.skin} />}
      >
        <p className="font-anton mt-4 text-2xl uppercase sm:text-3xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          {receipt?.title ?? "The jar is unchanged"}
        </p>
      </PageHero>
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="liquid-glass rounded-[var(--radius-24)] p-6">
          <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Before</p>
          <p className="font-anton mt-2 text-3xl uppercase leading-none" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {wholeChog(before)}
          </p>
          <p className="mt-2 text-sm text-[#EFF4FF]/65">Jar, a moment ago</p>
        </article>
        <article className="liquid-glass rounded-[var(--radius-24)] p-6">
          <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">After</p>
          <p className="font-anton mt-2 text-3xl uppercase leading-none" data-testid="saved-amount" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {wholeChog(after)}
          </p>
          <p className="mt-2 text-sm text-[#EFF4FF]/65" data-testid="wallet-amount">
            {view.walletLabel}
          </p>
        </article>
        <article className="liquid-glass rounded-[var(--radius-24)] p-6">
          <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Streak</p>
          <p className="font-anton mt-2 text-3xl uppercase leading-none text-[#6FFF00]" data-testid="streak-count" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {view.streakText}
          </p>
          <p className="mt-2 text-sm text-[#EFF4FF]/65">{returning ? "The run did not break." : "The morning counted."}</p>
        </article>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/app" className="font-anton flex h-14 items-center justify-center rounded-full bg-[#6FFF00] uppercase text-[#010828]">
          Today
        </Link>
        <Link href="/app/streak" className="font-anton flex h-14 items-center justify-center rounded-full border border-white/25 uppercase">
          Streak
        </Link>
        <Link href="/app/history" className="font-anton flex h-14 items-center justify-center rounded-full border border-white/25 uppercase">
          History
        </Link>
      </div>
    </PageFrame>
  );
}
