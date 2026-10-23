"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PageHeading } from "@/components/app/app-shell";
import { useWalletChogs } from "@/components/app/use-wallet-chogs";
import { setHeldPet } from "@/lib/held-pet";
import { OPENSEA_GENESIS } from "@/lib/feed-gate";
import { formatChog } from "@/lib/format";

export function ConnectFlow() {
  const wallet = useWalletChogs();
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState("");

  if (!wallet.connection.isConnected) {
    return (
      <Screen kicker="monad only" title="Connect" lede="The pet is the Chog you hold. Demo mode on Today still works with no wallet.">
        <p className="text-sm leading-relaxed text-[#EFF4FF]/80">
          Connect the wallet that holds your Chog. This pocket reads Monad only. MetaMask, Rabby, and other injected wallets can add the network.
        </p>
        <button
          type="button"
          data-testid="connect-wallet"
          className="font-anton h-14 w-full rounded-full bg-[#6FFF00] uppercase text-[#010828]"
          onClick={() => void wallet.connectWallet()}
        >
          Connect wallet
        </button>
        {wallet.connectError ? (
          <p className="text-sm text-[#EFF4FF]/75" data-testid="connect-error">
            {wallet.connectError}
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <Info title="Monad" body="Chain 143. $CHOG and the Chog you hold. No other chain." />
          <Info title="Injected" body="A browser wallet that can add Monad. Demo mode needs none of them." />
        </div>
        <Back />
      </Screen>
    );
  }

  if (!wallet.onMonad) {
    return (
      <Screen kicker="wrong network" title="Switch" lede="This pocket only lives on Monad. The wallet is open on another chain.">
        <p className="text-sm text-[#EFF4FF]/80" data-testid="wrong-network">
          Switch the wallet over to Monad, then the Chogs in it can be read.
        </p>
        <button
          type="button"
          className="font-anton h-14 w-full rounded-full bg-[#6FFF00] uppercase text-[#010828]"
          onClick={() => void wallet.switchToMonad()}
        >
          Switch to Monad
        </button>
        {wallet.switchError ? <p className="text-sm text-[#EFF4FF]/75">{wallet.switchError}</p> : null}
        <button type="button" className="text-sm text-[#EFF4FF]/70" onClick={() => wallet.disconnect()}>
          Disconnect
        </button>
        <Back />
      </Screen>
    );
  }

  if (wallet.held.isPending || wallet.balance.isPending) {
    return (
      <Screen kicker="on monad" title="Reading" lede="The wallet is connected. Checking $CHOG and the Chogs it holds.">
        <p className="text-sm" data-testid="wallet-loading">
          Reading your $CHOG…
        </p>
        <Back />
      </Screen>
    );
  }

  if (wallet.held.isError || wallet.balance.isError) {
    return (
      <Screen kicker="on monad" title="Could not read" lede="Monad did not answer. The samples on Today still work.">
        <p className="text-sm" data-testid="chain-error">
          Could not read $CHOG from Monad. Try again in a moment.
        </p>
        <button type="button" className="font-anton h-12 rounded-full border border-white/25 px-6 uppercase" onClick={() => void wallet.held.refetch()}>
          Try again
        </button>
        <Back />
      </Screen>
    );
  }

  if (wallet.held.data === 0n) {
    return (
      <Screen kicker="connected" title="No Chog" lede="Monad answered. This address holds none of the collection.">
        <p className="text-sm leading-relaxed" data-testid="no-chog">
          This wallet does not hold a Chog Genesis. The sample pet, arcade, and leaderboard still work. A real set-aside needs a Genesis picture.
        </p>
        <a className="text-sm text-[#6FFF00] underline" href={OPENSEA_GENESIS} target="_blank" rel="noreferrer">
          Chog Genesis on OpenSea
        </a>
        <TokenForm
          tokenInput={tokenInput}
          setTokenInput={setTokenInput}
          busy={wallet.busy}
          petError={wallet.petError}
          onOpen={async (id) => {
            const next = await wallet.openToken(id);
            if (next) {
              setHeldPet(next);
              router.push("/app");
            }
          }}
        />
        <Back />
      </Screen>
    );
  }

  return (
    <Screen kicker="connected" title="Your Chog" lede="The wallet is on Monad. Pick the picture that should be the pet.">
      <p className="text-sm" data-testid="wallet-amount">
        {wallet.balance.data === undefined ? "Reading your $CHOG…" : `${formatChog(wallet.balance.data)} $CHOG in hand`}
      </p>
      <p className="text-sm text-[#EFF4FF]/70">{wallet.address}</p>
      {wallet.progress ? (
        <p className="text-sm" data-testid="scan-status">
          Looking for your Chogs… {wallet.progress.checked} of {wallet.progress.total} checked.
        </p>
      ) : null}
      {wallet.scanError ? <p className="text-sm text-[#EFF4FF]/70">{wallet.scanError}</p> : null}
      {wallet.found.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {wallet.found.map((id) => (
            <button
              key={id}
              type="button"
              className="font-anton h-10 rounded-full border border-white/25 px-4 text-sm uppercase"
              onClick={() =>
                void wallet.openToken(id).then((next) => {
                  if (!next) return;
                  setHeldPet(next);
                  router.push("/app");
                })
              }
            >
              Use token {id}
            </button>
          ))}
        </div>
      ) : null}
      <TokenForm
        tokenInput={tokenInput}
        setTokenInput={setTokenInput}
        busy={wallet.busy}
        petError={wallet.petError}
        onOpen={async (id) => {
          const next = await wallet.openToken(id);
          if (next) {
            setHeldPet(next);
            router.push("/app");
          }
        }}
      />
      {wallet.pet ? <p className="text-sm text-[#6FFF00]">{wallet.pet.name} is ready.</p> : null}
      <Link href="/app/pets" className="text-sm text-[#6FFF00]">
        See pets
      </Link>
      <Back />
    </Screen>
  );
}

function Screen({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 py-4 lg:min-h-[calc(100dvh-2rem)] lg:grid-cols-[0.9fr_1.1fr] lg:py-6">
      <aside className="relative min-h-[280px] overflow-hidden rounded-[var(--radius-24)] bg-[#F4845F] shadow-[0_24px_80px_rgba(0,0,0,0.35)] lg:min-h-full">
        <p
          className="font-anton absolute inset-x-0 top-[16%] text-center text-white uppercase"
          style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: "clamp(64px, 10vw, 140px)", lineHeight: 0.85 }}
        >
          CHOG
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figures/bubblegum.png" alt="Bubblegum Chog figurine" className="absolute bottom-16 left-1/2 h-[58%] w-auto -translate-x-1/2 object-contain" />
        <p className="font-anton absolute bottom-4 left-4 text-2xl text-white uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          Hold one.
          <br />
          That is the pet.
        </p>
      </aside>
      <div className="liquid-glass flex h-full flex-col gap-4 rounded-[var(--radius-24)] p-6 sm:p-8">
        <PageHeading kicker={kicker} title={title} lede={lede} />
        {children}
        <div className="mt-auto grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
          <p className="text-sm leading-snug text-[#EFF4FF]/70">The pet is the Chog you hold. Samples keep the pocket open.</p>
          <p className="text-sm leading-snug text-[#EFF4FF]/70">Monad only. Chain 143. The jar on this phone is the demo.</p>
          <Link href="/app" className="text-sm text-[#6FFF00]">
            Today is one tap away.
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-18)] border border-white/10 bg-[#010828]/40 p-4">
      <p className="font-anton text-xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
        {title}
      </p>
      <p className="mt-1 text-sm text-[#EFF4FF]/70">{body}</p>
    </div>
  );
}

function Back() {
  return (
    <Link href="/app" data-testid="back-to-demo" className="font-anton text-sm uppercase text-[#6FFF00]">
      Back to samples
    </Link>
  );
}

function TokenForm({
  tokenInput,
  setTokenInput,
  onOpen,
  busy,
  petError,
}: {
  tokenInput: string;
  setTokenInput: (value: string) => void;
  onOpen: (id: number) => void;
  busy: string | null;
  petError: string | null;
}) {
  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        const id = Number(tokenInput);
        if (!Number.isInteger(id) || id <= 0) return;
        onOpen(id);
      }}
    >
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="token-id">
          Token id
        </label>
        <input
          id="token-id"
          data-testid="token-id"
          inputMode="numeric"
          placeholder="Token id"
          value={tokenInput}
          onChange={(event) => setTokenInput(event.target.value)}
          className="h-12 flex-1 rounded-full border border-white/20 bg-transparent px-4 text-sm"
        />
        <button type="submit" className="font-anton h-12 rounded-full border border-white/25 px-4 uppercase">
          Open
        </button>
      </div>
      {busy ? <p className="text-sm">{busy}</p> : null}
      {petError ? (
        <p className="text-sm" data-testid="pet-error">
          {petError}
        </p>
      ) : null}
    </form>
  );
}
