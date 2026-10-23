"use client";

import Link from "next/link";
import { useState } from "react";
import { PageFrame, PageHero } from "@/components/app/page-hero";
import { ShareButton } from "@/components/app/share-button";
import { WhyChog } from "@/components/app/why-chog";
import { AppProviders } from "@/components/app/providers";
import { usePocket } from "@/components/app/use-pocket";
import { useWalletChogs } from "@/components/app/use-wallet-chogs";
import { setHeldPet } from "@/lib/held-pet";
import type { PetMemory } from "@/lib/memory";
import { inheritedExample } from "@/lib/memory-store";
import { DEMO_CHOGS } from "@/lib/pets";
import { commaWhole, shareTokenNumber } from "@/lib/share-card";

const FIGURES: Record<string, string> = {
  bubblegum: "/figures/bubblegum.png",
  laser: "/figures/laser.png",
  crown: "/figures/crown.png",
  quiet: "/figures/quiet.png",
};

export default function PetsPage() {
  return (
    <AppProviders>
      <PetsBody />
    </AppProviders>
  );
}

function PetsBody() {
  const { demo, pet, setPet, memory, memoryBook } = usePocket();
  const wallet = useWalletChogs();
  const [tokenInput, setTokenInput] = useState("");

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  return (
    <PageFrame>
      <PageHero
        petName={pet.name}
        imageUrl={pet.imageUrl}
        word="PICK"
        kicker="pick a picture"
        title="Pets"
        lede="The sample Chogs use real trait names. A Chog in your wallet can take the stage too. The jar on this phone stays with you."
      >
        <p className="mt-3 text-sm text-white/90">
          Now showing <span className="font-anton uppercase">{pet.name}</span>.
        </p>
      </PageHero>
      <WhyChog />
      <section className="grid items-start gap-4 lg:grid-cols-2" data-testid="pet-memory">
        <article className="liquid-glass rounded-[var(--radius-24)] p-6">
          <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">This Chog remembers</p>
          <h2 className="font-anton mt-2 text-3xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {pet.tokenId != null ? `Chog #${pet.tokenId}` : pet.name}
          </h2>
          <p className="font-anton mt-4 text-2xl uppercase" data-testid="memory-streak" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {memory.streak} day streak
          </p>
          <p className="mt-1 text-sm text-[#EFF4FF]/75" data-testid="memory-jar">
            {commaWhole(BigInt(memory.jarTotal))} $CHOG set aside in its name
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#EFF4FF]/75" data-testid="memory-moods">
            {memory.moodHistory.length === 0 ? (
              <li>No moods yet. Set $CHOG aside and the mood stays on this token.</li>
            ) : (
              memory.moodHistory.map((mark) => (
                <li key={`${mark.at}-${mark.mood}`}>
                  {mark.title} · day {mark.day}
                </li>
              ))
            )}
          </ul>
          <div className="mt-5">
            <ShareButton tokenId={shareTokenNumber(pet.id, pet.tokenId)} streak={memory.streak} saved={BigInt(memory.jarTotal)} />
          </div>
        </article>
        <Inherited memory={memoryBook["token:123"] ?? inheritedExample()} />
      </section>
      <section className="grid items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-anton text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            Samples
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {DEMO_CHOGS.map((choice) => {
              const on = !walletPetSelected(pet.id) && choice.id === demo.petId;
              return (
                <button
                  key={choice.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPet(choice.id)}
                  className={`overflow-hidden rounded-[var(--radius-24)] border text-left ${on ? "border-[#6FFF00] shadow-[0_0_0_1px_#6FFF00]" : "border-white/15"}`}
                >
                  <span className="flex h-40 items-end justify-center bg-[#121a3d] sm:h-52">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={FIGURES[choice.id]} alt="" className="h-[88%] w-auto object-contain" />
                  </span>
                  <span className="block bg-[#071033] px-3 py-3 font-anton text-sm leading-tight uppercase break-words sm:px-4 sm:py-4 sm:text-lg" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                    {choice.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <section className="liquid-glass flex flex-col self-start rounded-[var(--radius-24)] p-6" data-testid="wallet-pets">
          <h2 className="font-anton text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            In your wallet
          </h2>
          {!wallet.connection.isConnected ? (
            <div className="mt-4">
              <p className="text-sm leading-relaxed text-[#EFF4FF]/75">No wallet yet. Connect one that holds a Chog, or stay with the samples.</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#EFF4FF]/75">
                <li>Samples stay on this phone.</li>
                <li>A held Chog can take the stage.</li>
                <li>Switching pets leaves the jar where it is.</li>
              </ul>
              <Link href="/connect" className="font-anton mt-5 inline-flex h-12 items-center justify-center rounded-full bg-[#6FFF00] px-6 uppercase text-[#010828]">
                Connect a wallet
              </Link>
            </div>
          ) : !wallet.onMonad ? (
            <div className="mt-4">
              <p className="text-sm text-[#EFF4FF]/75">This wallet is not on Monad. Switch the network on the connect screen.</p>
              <Link href="/connect" className="mt-3 inline-block text-sm text-[#6FFF00]">
                Fix the network
              </Link>
            </div>
          ) : wallet.held.isPending ? (
            <p className="mt-4 text-sm">Looking for your Chogs…</p>
          ) : wallet.held.isError ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm">Could not read the collection from Monad.</p>
              <button type="button" className="text-sm text-[#6FFF00]" onClick={() => void wallet.held.refetch()}>
                Try again
              </button>
            </div>
          ) : wallet.held.data === 0n ? (
            <p className="mt-4 text-sm leading-relaxed text-[#EFF4FF]/75">This wallet does not hold a Chog from the collection. The samples still work.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {wallet.progress ? (
                <p className="text-sm">
                  Looking for your Chogs… {wallet.progress.checked} of {wallet.progress.total} checked.
                </p>
              ) : null}
              {wallet.scanError ? <p className="text-sm text-[#EFF4FF]/70">{wallet.scanError}</p> : null}
              <div className="flex flex-wrap gap-2">
                {wallet.found.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="font-anton h-10 rounded-full border border-white/25 px-4 text-sm uppercase"
                    onClick={() =>
                      void wallet.openToken(id).then((next) => {
                        if (next) setHeldPet(next);
                      })
                    }
                  >
                    Token {id}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const id = Number(tokenInput);
                  if (!Number.isInteger(id) || id <= 0) return;
                  void wallet.openToken(id).then((next) => {
                    if (next) setHeldPet(next);
                  });
                }}
              >
                <label className="sr-only" htmlFor="held-token">
                  Token id
                </label>
                <input
                  id="held-token"
                  inputMode="numeric"
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  placeholder="Token id"
                  className="h-12 flex-1 rounded-full border border-white/20 bg-transparent px-4 text-sm"
                />
                <button type="submit" className="font-anton h-12 rounded-full border border-white/25 px-4 uppercase">
                  Open
                </button>
              </form>
              {wallet.busy ? <p className="text-sm">{wallet.busy}</p> : null}
              {wallet.petError ? <p className="text-sm">{wallet.petError}</p> : null}
            </div>
          )}
        </section>
      </section>
    </PageFrame>
  );
}

function Inherited({ memory }: { memory: PetMemory }) {
  return (
    <article className="liquid-glass rounded-[var(--radius-24)] p-6" data-testid="inherit-memory">
      <p className="text-[11px] tracking-[0.16em] text-[#F5B942] uppercase">A buyer inherits this</p>
      <h2 className="font-anton mt-2 text-3xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
        Chog #{memory.tokenId}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[#EFF4FF]/75">
        This record is keyed by token {memory.tokenId}, not by a wallet. The next keeper of this Chog loads the same streak, jar total, and moods. The coins in the phone jar stay with the person who set them aside.
      </p>
      <p className="font-anton mt-4 text-2xl uppercase" data-testid="inherit-streak" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
        {memory.streak} day streak
      </p>
      <p className="mt-1 text-sm text-[#EFF4FF]/75" data-testid="inherit-jar">
        {commaWhole(BigInt(memory.jarTotal))} $CHOG set aside in its name
      </p>
      <ul className="mt-4 space-y-2 text-sm text-[#EFF4FF]/75">
        {memory.moodHistory.map((mark) => (
          <li key={`${mark.at}-${mark.title}`}>{mark.title}</li>
        ))}
      </ul>
      <div className="mt-5">
        <ShareButton testId="share-inherit" tokenId={memory.tokenId ?? 123} streak={memory.streak} saved={BigInt(memory.jarTotal)} />
      </div>
    </article>
  );
}

function walletPetSelected(id: string) {
  return id.startsWith("token-");
}
