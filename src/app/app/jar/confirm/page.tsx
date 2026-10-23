"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { JarMark } from "@/components/app/jar-mark";
import { PageFrame, PageHero } from "@/components/app/page-hero";
import { usePocket } from "@/components/app/use-pocket";
import { wholeChog } from "@/lib/format";
import { jarFill } from "@/lib/savings";

export default function ConfirmTakeBack() {
  const router = useRouter();
  const { demo, pet, view, takeBack, withdraw, tier } = usePocket();

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  if (demo.state.saved === 0n) {
    return (
      <PageFrame>
        <PageHero
          petName={pet.name}
          imageUrl={pet.imageUrl}
          word="EMPTY"
          kicker="nothing there"
          title="Jar is empty"
          lede="There is no $CHOG to take back. Set some aside first. The streak is waiting either way."
          aside={<JarMark percent={0} label="Jar is empty" skin={tier.skin} />}
        />
        <section className="grid items-start gap-4 lg:grid-cols-2">
          <article className="liquid-glass flex flex-col justify-between rounded-[var(--radius-24)] p-6">
            <div>
              <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">Next</p>
              <p className="font-anton mt-2 text-3xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                Fill it first
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#EFF4FF]/75">
                A take-back only moves coins that are already in the jar. The hand still holds {view.walletLabel.replace(" in hand", "")}.
              </p>
            </div>
            <Link href="/app/jar" className="font-anton mt-6 flex h-14 items-center justify-center rounded-full bg-[#6FFF00] uppercase text-[#010828]">
              Back to the jar
            </Link>
          </article>
          <article className="liquid-glass flex flex-col justify-between rounded-[var(--radius-24)] p-6">
            <div>
              <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">The streak</p>
              <p className="font-anton mt-2 text-3xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                {view.streakText}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#EFF4FF]/75">
                Taking coins back never breaks the run. Today still has the pet, the mood, and the one action.
              </p>
            </div>
            <Link href="/app" className="mt-6 text-sm text-[#6FFF00]">
              Back to today
            </Link>
          </article>
        </section>
      </PageFrame>
    );
  }

  const after = demo.state.saved - takeBack;
  const from = jarFill(demo.state.saved, demo.state.goal);
  const to = jarFill(after, demo.state.goal);

  return (
    <PageFrame>
      <PageHero
        petName={pet.name}
        imageUrl={pet.imageUrl}
        word="BACK"
        kicker="still yours"
        title="Take it back?"
        lede={`${wholeChog(takeBack)} goes back in hand. The streak stays. The pet just notices.`}
        aside={<JarMark percent={to} fromPercent={from} label={`Jar moving from ${wholeChog(demo.state.saved)} to ${wholeChog(after)}`} skin={tier.skin} />}
      />
      <section className="grid items-start gap-4 lg:grid-cols-3">
        <article className="liquid-glass rounded-[var(--radius-24)] p-6">
          <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Before</p>
          <p className="font-anton mt-3 text-4xl uppercase leading-none" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {wholeChog(demo.state.saved)}
          </p>
          <p className="mt-3 text-sm text-[#EFF4FF]/70">In the jar now.</p>
        </article>
        <article className="liquid-glass rounded-[var(--radius-24)] p-6">
          <p className="text-[11px] tracking-[0.16em] text-[#F5B942] uppercase">After</p>
          <p className="font-anton mt-3 text-4xl uppercase leading-none text-[#F5B942]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {wholeChog(after)}
          </p>
          <p className="mt-3 text-sm text-[#EFF4FF]/70">Left in the jar. {wholeChog(takeBack)} returns to the hand.</p>
        </article>
        <article className="liquid-glass flex flex-col justify-between gap-4 rounded-[var(--radius-24)] p-6">
          <p className="text-sm leading-relaxed text-[#EFF4FF]/75">This is a return, not a spend. The coins never left your pocket for good.</p>
          <div className="space-y-3">
            <button
              type="button"
              data-testid="confirm-withdraw"
              className="font-anton h-14 w-full rounded-full bg-[#6FFF00] uppercase text-[#010828]"
              onClick={() => {
                if (withdraw()) router.push("/app/jar/done");
              }}
            >
              Return {wholeChog(takeBack)}
            </button>
            <Link href="/app/jar" className="font-anton flex h-12 items-center justify-center rounded-full border border-white/25 uppercase">
              Cancel
            </Link>
          </div>
        </article>
      </section>
    </PageFrame>
  );
}
