"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeedButton } from "@/components/app/feed-button";
import { GenesisPet } from "@/components/app/genesis-pet";
import { JarMark } from "@/components/app/jar-mark";
import { PageFrame, PageHero } from "@/components/app/page-hero";
import { usePocket } from "@/components/app/use-pocket";
import { formatChog, wholeChog } from "@/lib/format";
import { GOAL_PRESETS } from "@/lib/savings";

const pillOn = "font-anton h-12 rounded-full bg-[#6FFF00] text-[#010828] uppercase";
const pillOff = "font-anton h-12 rounded-full border border-white/25 bg-transparent text-[#EFF4FF] uppercase";

export default function JarPage() {
  const router = useRouter();
  const { demo, view, pet, setGoal, feed, tier } = usePocket();

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  return (
    <PageFrame>
      <PageHero
        petName={pet.name}
        imageUrl={pet.imageUrl}
        word="JAR"
        kicker="still yours"
        title="The jar"
        lede="Set $CHOG aside once a day. It stays in the jar until you take it back. Withdraw does not break the streak."
        aside={<JarMark percent={view.jarPercent} label={view.savedLabel} skin={tier.skin} />}
      >
        <p className="font-anton mt-4 text-2xl leading-none uppercase sm:text-4xl" data-testid="saved-amount" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          {view.savedLabel}
        </p>
        <p className="mt-2 text-sm text-white/85" data-testid="wallet-amount">
          {view.walletLabel}
        </p>
      </PageHero>
      <GenesisPet />
      <section className="grid items-start gap-4 lg:grid-cols-3">
        <article className="liquid-glass flex flex-col rounded-[var(--radius-24)] p-6 lg:col-span-2 lg:p-6">
          <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Daily amount</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {GOAL_PRESETS.map((goal) => {
              const label = formatChog(goal);
              const selected = demo.state.goal === goal;
              return (
                <button
                  key={label}
                  type="button"
                  data-testid={`goal-${label}`}
                  aria-pressed={selected}
                  className={selected ? pillOn : pillOff}
                  onClick={() => setGoal(goal)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#EFF4FF]/70">
            Smallest set-aside is 50 $CHOG. The hand is holding {wholeChog(demo.state.wallet)}. A week of this amount fills the picture of the jar.
          </p>
        </article>
        <article className="liquid-glass flex flex-col justify-between gap-4 rounded-[var(--radius-24)] p-6 lg:p-6">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Today</p>
            <FeedButton
              label={view.feedLabel}
              disabled={view.feedDisabled}
              className="font-anton h-14 w-full rounded-full bg-[#6FFF00] text-base uppercase text-[#010828] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-[#EFF4FF]/50"
              pet={pet}
              amount={demo.state.goal}
              onDemo={() => feed()}
              onDone={() => router.push("/app/jar/done")}
            />
            {view.feedHint ? <p className="mt-3 text-center text-sm text-[#EFF4FF]/70">{view.feedHint}</p> : null}
          </div>
          <div className="space-y-3">
            {demo.state.saved > 0n ? (
              <Link
                href="/app/jar/confirm"
                data-testid="withdraw-button"
                className="font-anton flex h-12 w-full items-center justify-center rounded-full border border-white/25 text-sm uppercase"
              >
                Take some back
              </Link>
            ) : (
              <p className="text-center text-sm text-[#EFF4FF]/65">Nothing to take back yet. The first set-aside fills the jar.</p>
            )}
            <Link href="/app/history" className="block text-center text-sm text-[#6FFF00]">
              See jar history
            </Link>
          </div>
        </article>
      </section>
    </PageFrame>
  );
}
