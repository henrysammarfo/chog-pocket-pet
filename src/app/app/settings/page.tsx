"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HowItWorks } from "@/components/app/how-it-works";
import { PageFrame, PageHero } from "@/components/app/page-hero";
import { AppProviders } from "@/components/app/providers";
import { usePocket } from "@/components/app/use-pocket";
import { useWalletChogs } from "@/components/app/use-wallet-chogs";

export default function SettingsPage() {
  return (
    <AppProviders>
      <SettingsBody />
    </AppProviders>
  );
}

function SettingsBody() {
  const router = useRouter();
  const { demo, pet, reset, tier, setSpeed } = usePocket();
  const wallet = useWalletChogs();
  const connected = wallet.connection.isConnected;

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  return (
    <PageFrame>
      <PageHero
        petName={pet.name}
        imageUrl={pet.imageUrl}
        word="YOU"
        kicker="your phone"
        title="Settings"
        lede="The wallet is optional. Demo mode is the full loop until a jar is deployed on Monad."
      />
      <section className="grid items-start gap-4 lg:grid-cols-3">
        <article className="liquid-glass flex flex-col justify-between gap-6 self-start rounded-[var(--radius-24)] p-6" data-testid="settings-wallet">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">Wallet</p>
            {connected && wallet.address ? (
              <>
                <p className="font-anton mt-3 text-3xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                  Connected
                </p>
                <p className="mt-2 text-sm break-all text-[#EFF4FF]/75">{wallet.address}</p>
                <p className="mt-2 text-sm text-[#EFF4FF]/70">{wallet.onMonad ? "On Monad." : "Not on Monad yet."}</p>
              </>
            ) : (
              <>
                <p className="font-anton mt-3 text-3xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                  Not connected
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#EFF4FF]/70">Connect the wallet that holds your Chog. The samples keep working either way.</p>
              </>
            )}
          </div>
          {connected && wallet.address ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/connect" className="font-anton inline-flex h-11 items-center rounded-full border border-white/25 px-4 text-sm uppercase">
                Connection details
              </Link>
              <button
                type="button"
                data-testid="disconnect-wallet"
                className="font-anton h-11 rounded-full bg-[#6FFF00] px-4 text-sm uppercase text-[#010828]"
                onClick={() => wallet.disconnect()}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <Link
              href="/connect"
              data-testid="use-wallet"
              className="font-anton mt-5 inline-flex h-12 items-center justify-center rounded-full bg-[#6FFF00] px-6 uppercase text-[#010828]"
            >
              Use my Chog
            </Link>
          )}
        </article>
        <article className="liquid-glass flex flex-col justify-between gap-6 self-start rounded-[var(--radius-24)] p-6">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">Demo</p>
            <p className="mt-3 text-sm leading-relaxed text-[#EFF4FF]/75">Start over clears the jar, the streak, the demo clock, and the history on this phone.</p>
          </div>
          <div className="mt-5 flex flex-col items-start gap-3">
            <button
              type="button"
              data-testid="reset-button"
              className="font-anton h-12 rounded-full border border-white/25 px-6 uppercase"
              onClick={() => {
                reset();
                router.push("/app");
              }}
            >
              Start over
            </button>
            <HowItWorks />
          </div>
        </article>
        <article className="liquid-glass flex flex-col self-start rounded-[var(--radius-24)] p-6">
          <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Elsewhere</p>
          <div className="mt-4 grid flex-1 gap-2">
            <Link href="/" className="flex min-h-[var(--control)] items-center rounded-[var(--radius-18)] border border-white/10 px-4 text-sm hover:border-[#6FFF00]">
              The story
            </Link>
            <Link href="/gallery" className="flex min-h-[var(--control)] items-center rounded-[var(--radius-18)] border border-white/10 px-4 text-sm hover:border-[#6FFF00]">
              Figurine gallery
            </Link>
            <Link href="/care" className="flex min-h-[var(--control)] items-center rounded-[var(--radius-18)] border border-white/10 px-4 text-sm hover:border-[#6FFF00]">
              Care
            </Link>
            <Link href="/collection" className="flex min-h-[var(--control)] items-center rounded-[var(--radius-18)] border border-white/10 px-4 text-sm hover:border-[#6FFF00]">
              Mood collection
            </Link>
            <Link href="/judges" className="flex min-h-[var(--control)] items-center rounded-[var(--radius-18)] border border-white/10 px-4 text-sm text-[#6FFF00] hover:border-[#6FFF00]">
              For judges
            </Link>
          </div>
        </article>
      </section>
      <section className="grid items-start gap-4 lg:grid-cols-2">
        <article className="liquid-glass rounded-[var(--radius-24)] p-6">
          <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">Demo clock</p>
          <h2 className="font-anton mt-2 text-3xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {demo.speed === "minute" ? "1 day = 1 minute" : "1 day = 1 day"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#EFF4FF]/75">
            Judges can watch a streak move without waiting overnight. The real jar still counts UTC days.
          </p>
          <button
            type="button"
            data-testid="speed-toggle"
            aria-pressed={demo.speed === "minute"}
            className="font-anton mt-5 h-[var(--control)] rounded-full bg-[#6FFF00] px-6 uppercase text-[#010828]"
            onClick={() => setSpeed(demo.speed === "minute" ? "day" : "minute")}
          >
            {demo.speed === "minute" ? "Use real days" : "1 day = 1 minute"}
          </button>
        </article>
        <article className="liquid-glass rounded-[var(--radius-24)] p-6" data-testid="holder-tier">
          <p className="text-[11px] tracking-[0.16em] text-[#F5B942] uppercase">$CHOG in hand</p>
          <h2 className="font-anton mt-2 text-3xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            {tier.name}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#EFF4FF]/75">{tier.detail}</p>
          <p className="mt-3 text-sm text-[#EFF4FF]/70">
            {tier.freeze ? `Streak freeze left: ${demo.freezeLeft}.` : "No streak freeze at this balance."}{" "}
            {tier.skin === "peach" ? "Peach jar skin is on." : "Jar skin is the plain glass."}
          </p>
        </article>
      </section>
    </PageFrame>
  );
}
