"use client";

import Link from "next/link";
import { PageFrame, PageHero } from "@/components/app/page-hero";
import { WhyChog } from "@/components/app/why-chog";
import { usePocket } from "@/components/app/use-pocket";
import { savingRules } from "@/lib/trait-rules";

export default function TraitsPage() {
  const { demo, pet, view } = usePocket();

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  return (
    <PageFrame>
      <PageHero
        petName={pet.name}
        imageUrl={pet.imageUrl}
        word="VOICE"
        kicker="said out loud"
        title="Traits"
        lede="Eyes, mouth, clothes. They pick the voice. Each one also changes a rule of the jar."
      />
      <WhyChog />
      <section className="grid items-start gap-4 sm:grid-cols-2" data-testid="trait-rules">
        {savingRules(pet.traits).map((rule) => (
          <article key={rule.id} className="liquid-glass rounded-[var(--radius-24)] p-6">
            <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">{rule.trait}</p>
            <h2 className="font-anton mt-2 text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              {rule.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#EFF4FF]/75">{rule.detail}</p>
          </article>
        ))}
      </section>
      <section className="grid items-start gap-4 lg:grid-cols-3">
        <article className="liquid-glass flex flex-col gap-6 self-start rounded-[var(--radius-24)] p-6 lg:col-span-1">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">Personality</p>
            <p className="mt-3 text-base leading-relaxed text-[#EFF4FF]" data-testid="personality">
              {view.personality}
            </p>
          </div>
          <Link href="/app/pets" className="font-anton mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#6FFF00] px-6 uppercase text-[#010828]">
            Switch pet
          </Link>
        </article>
        <ul data-testid="trait-list" className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-2">
          {view.traits.map((trait) => (
            <li key={trait.name} className="liquid-glass rounded-[var(--radius-24)] px-4 py-4">
              <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">{trait.name}</p>
              <p className="font-anton mt-2 text-base leading-tight uppercase sm:text-2xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                {trait.value}
              </p>
            </li>
          ))}
        </ul>
      </section>
      {view.traits.length === 0 ? <p className="text-sm text-[#EFF4FF]/70">This Chog has no traits to read yet.</p> : null}
    </PageFrame>
  );
}
