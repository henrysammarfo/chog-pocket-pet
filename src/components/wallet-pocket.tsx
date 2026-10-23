"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { monad } from "viem/chains";
import {
  useConnect,
  useConnection,
  useConnectors,
  useReadContract,
  useSwitchChain,
  useWriteContract,
  WagmiProvider,
} from "wagmi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FeedBlockCard } from "@/components/app/feed-button";
import { PocketStage } from "@/components/pocket-stage";
import { erc20Abi, erc721Abi, jarAbi } from "@/lib/abi";
import { asChainPocket } from "@/lib/chain-pocket";
import {
  chogNftAddress,
  chogTokenAddress,
  jarAddress,
  MONADSCAN,
} from "@/lib/config";
import { formatChog } from "@/lib/format";
import { readOwnedPet } from "@/lib/read-pet";
import type { ChogPet } from "@/lib/pets";
import { buildView } from "@/lib/present";
import { scanOwnedChogs, monadClient } from "@/lib/scan-chogs";
import {
  DEFAULT_GOAL,
  GOAL_PRESETS,
  MIN_FEED,
  type PocketState,
} from "@/lib/savings";
import { assessFeed, mapJarError, type FeedBlock } from "@/lib/feed-gate";
import { plainTxError } from "@/lib/tx-error";
import { currentUtcDay } from "@/lib/streak";
import { wagmiConfig } from "@/lib/wagmi";

export function WalletPocket({ onBack }: { onBack: () => void }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletInner onBack={onBack} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function WalletInner({ onBack }: { onBack: () => void }) {
  const connection = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const switchChain = useSwitchChain();
  const write = useWriteContract();
  const jar = jarAddress();
  const token = chogTokenAddress();
  const nft = chogNftAddress();
  const address = connection.address;

  const balance = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
  const held = useReadContract({
    address: nft,
    abi: erc721Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
  const supply = useReadContract({
    address: nft,
    abi: erc721Abi,
    functionName: "totalSupply",
    query: { enabled: Boolean(address) },
  });
  const pocketRead = useReadContract({
    address: jar ?? undefined,
    abi: jarAbi,
    functionName: "pockets",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && jar) },
  });
  const minFeedRead = useReadContract({
    address: jar ?? undefined,
    abi: jarAbi,
    functionName: "minFeed",
    query: { enabled: Boolean(jar) },
  });

  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [pet, setPet] = useState<ChogPet | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [petError, setPetError] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [found, setFound] = useState<number[]>([]);
  const [progress, setProgress] = useState<{ checked: number; total: number } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [feedBlock, setFeedBlock] = useState<FeedBlock | null>(null);
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);
  const [scannedFor, setScannedFor] = useState<string | null>(null);

  const floor = minFeedRead.data && minFeedRead.data > MIN_FEED ? minFeedRead.data : MIN_FEED;
  const activeGoal = goal < floor ? floor : goal;
  const presets = GOAL_PRESETS.filter((amount) => amount >= floor);

  useEffect(() => {
    if (!address || connection.chainId !== monad.id) return;
    if (held.data === undefined || held.data === 0n || supply.data === undefined) return;
    if (scannedFor === address) return;
    const controller = new AbortController();
    const owner = address;
    scanOwnedChogs({
      owner,
      supply: Number(supply.data),
      signal: controller.signal,
      onProgress: (checked, total) => setProgress({ checked, total }),
    })
      .then(async (ids) => {
        if (controller.signal.aborted) return;
        setFound(ids);
        setScannedFor(owner);
        setProgress(null);
        if (ids.length === 1) {
          try {
            setPet(await readOwnedPet(ids[0], owner));
            setPetError(null);
          } catch (error) {
            setPetError(error instanceof Error ? error.message : "That Chog did not open.");
          }
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setScanError("The search stopped early. Type a token id if you have it.");
        setProgress(null);
      });
    return () => controller.abort();
  }, [address, connection.chainId, held.data, supply.data, scannedFor]);

  async function connectWallet() {
    setConnectError(null);
    const connector = connectors[0];
    if (!connector) {
      setConnectError("No wallet found in this browser. Demo mode still works.");
      return;
    }
    try {
      await connect.mutateAsync({ connector });
    } catch {
      setConnectError("No wallet found in this browser. Demo mode still works.");
    }
  }

  async function openToken(raw: number) {
    if (!address) return;
    setPetError(null);
    setBusy("Opening this Chog…");
    try {
      setPet(await readOwnedPet(raw, address));
    } catch (error) {
      setPet(null);
      setPetError(error instanceof Error ? error.message : "That Chog did not open.");
    } finally {
      setBusy(null);
    }
  }

  const chain = asChainPocket(pocketRead.data);
  const [today] = useState(currentUtcDay);
  const pocketState: PocketState = {
    wallet: balance.data ?? 0n,
    saved: chain?.saved ?? 0n,
    lastFeedDay: chain?.lastFeedDay ?? 0,
    streak: chain?.streak ?? 0,
    goal: activeGoal,
    withdrewOnDay: chain?.withdrewOnDay ?? 0,
  };
  const view = pet ? buildView(pet, pocketState, today, jar !== null) : null;
  const onMonad = connection.chainId === monad.id;

  async function refresh() {
    await Promise.all([balance.refetch(), pocketRead.refetch(), held.refetch()]);
  }

  async function feedOnChain() {
    if (!jar || !address || !pet?.tokenId) return;
    setTxError(null);
    setFeedBlock(null);
    setBusy("Checking your Chog and $CHOG…");
    try {
      const client = monadClient();
      const [nftBalance, chogBalance, allowance] = await Promise.all([
        client.readContract({ address: nft, abi: erc721Abi, functionName: "balanceOf", args: [address] }),
        client.readContract({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [address] }),
        client.readContract({ address: token, abi: erc20Abi, functionName: "allowance", args: [address, jar] }),
      ]);
      const gate = assessFeed({
        nftBalance,
        chogBalance,
        allowance,
        amount: activeGoal,
        minFeed: floor,
      });
      if (gate.kind !== "ok") {
        setFeedBlock(gate);
        return;
      }
      try {
        await client.simulateContract({
          address: jar,
          abi: jarAbi,
          functionName: "feed",
          args: [BigInt(pet.tokenId), activeGoal],
          account: address,
        });
      } catch (error) {
        setFeedBlock({ kind: "message", text: mapJarError(error) });
        return;
      }
      if (gate.needsApproval) {
        setBusy("Asking the wallet to allow the jar…");
        const approved = await write.mutateAsync({
          address: token,
          abi: erc20Abi,
          functionName: "approve",
          args: [jar, activeGoal],
        });
        await client.waitForTransactionReceipt({ hash: approved });
      }
      setBusy("Setting $CHOG aside…");
      const hash = await write.mutateAsync({
        address: jar,
        abi: jarAbi,
        functionName: "feed",
        args: [BigInt(pet.tokenId), activeGoal],
      });
      await client.waitForTransactionReceipt({ hash });
      setLastTx(hash);
      await refresh();
    } catch (error) {
      setTxError(mapJarError(error) || plainTxError(error));
    } finally {
      setBusy(null);
    }
  }

  async function withdrawOnChain() {
    if (!jar || !chain) return;
    const amount = chain.saved < activeGoal ? chain.saved : activeGoal;
    setTxError(null);
    setBusy("Sending $CHOG back…");
    try {
      const hash = await write.mutateAsync({
        address: jar,
        abi: jarAbi,
        functionName: "withdraw",
        args: [amount],
      });
      await monadClient().waitForTransactionReceipt({ hash });
      setLastTx(hash);
      await refresh();
    } catch (error) {
      setTxError(plainTxError(error));
    } finally {
      setBusy(null);
    }
  }

  if (view) {
    return (
      <PocketStage
        view={view}
        banner={
          <div className="text-right text-white">
            <span className="rounded-full bg-[#6FFF00] px-3 py-1 font-anton text-[11px] tracking-[0.16em] text-[#010828] uppercase">
              Monad
            </span>
            <p className="mt-2 text-xs">This Chog is the pet.</p>
          </div>
        }
      >
        {found.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto">
            {found.map((id) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={pet?.tokenId === id ? "default" : "outline"}
                onClick={() => void openToken(id)}
              >
                Token {id}
              </Button>
            ))}
          </div>
        ) : null}
        {jar ? (
          <div className="grid grid-cols-4 gap-2">
            {presets.map((amount) => {
              const label = formatChog(amount);
              return (
                <Button
                  key={label}
                  type="button"
                  size="sm"
                  variant={activeGoal === amount ? "default" : "secondary"}
                  aria-pressed={activeGoal === amount}
                  onClick={() => setGoal(amount)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        ) : null}
        <Button
          type="button"
          size="xl"
          data-testid="feed-button"
          disabled={!jar || view.feedDisabled || busy !== null}
          onClick={() => void feedOnChain()}
        >
          {busy ?? view.feedLabel}
        </Button>
        <FeedBlockCard block={feedBlock} />
        {txError ? <p className="text-center text-sm">{txError}</p> : null}
        {view.feedHint ? (
          <p className="text-center text-sm text-[#EFF4FF]/70" data-testid="feed-hint">
            {view.feedHint}
          </p>
        ) : null}
        {jar ? (
          <Dialog>
            <DialogTrigger
              disabled={pocketState.saved === 0n || busy !== null}
              render={<Button type="button" variant="outline" className="w-full" />}
            >
              Take some back
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Take $CHOG back?</DialogTitle>
                <DialogDescription>
                  This returns coins from your jar to your wallet. The streak stays.
                </DialogDescription>
              </DialogHeader>
              <Button type="button" onClick={() => void withdrawOnChain()}>
                Return them
              </Button>
            </DialogContent>
          </Dialog>
        ) : null}
        {lastTx ? (
          <a className="block text-center text-sm underline" href={`${MONADSCAN}/tx/${lastTx}`}>
            See it on Monadscan
          </a>
        ) : null}
        <Button type="button" variant="ghost" data-testid="back-to-demo" onClick={onBack}>
          Back to samples
        </Button>
      </PocketStage>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1180px] items-stretch gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
      <aside className="relative min-h-[320px] overflow-hidden rounded-[32px] bg-[#F4845F] lg:min-h-[640px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.08'/></svg>")}")`,
            backgroundSize: "200px 200px",
          }}
        />
        <p
          className="font-anton pointer-events-none absolute inset-x-0 top-[18%] text-center text-white uppercase"
          style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: "clamp(72px, 12vw, 180px)", lineHeight: 0.8 }}
        >
          CHOG
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figures/bubblegum.png"
          alt="Bubblegum Chog figurine"
          className="absolute bottom-24 left-1/2 h-[62%] w-auto -translate-x-1/2 object-contain sm:bottom-16 sm:h-[70%]"
        />
        <p className="font-anton absolute bottom-5 left-5 text-3xl text-white uppercase sm:text-4xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          Hold one.
          <br />
          That is the pet.
        </p>
      </aside>
      <div className="liquid-glass flex flex-col rounded-[32px] p-6 sm:p-8 lg:min-h-[640px]">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="font-anton text-4xl leading-none uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>Connect</p>
          <p className="mt-2 text-sm text-[#EFF4FF]/70">Monad. Your Chog, if you hold one.</p>
        </div>
        <Badge className="h-7 bg-[#6FFF00] px-3 font-anton text-[11px] tracking-widest text-[#010828] uppercase">Monad</Badge>
      </header>

      {!connection.isConnected ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#EFF4FF]/80">
            Connect the wallet that holds your Chog. The pet is that picture. Without
            it, this side of the pocket stays empty. Demo mode on the pocket still works with no wallet.
          </p>
          <Button type="button" size="xl" className="font-anton h-14 w-full rounded-full bg-[#6FFF00] uppercase text-[#010828] hover:bg-[#8dff33]" data-testid="connect-wallet" onClick={() => void connectWallet()}>
            Connect wallet
          </Button>
          {connectError ? (
            <p className="text-sm text-[#EFF4FF]/70" data-testid="connect-error">
              {connectError}
            </p>
          ) : null}
          <Button type="button" variant="ghost" className="font-anton uppercase text-[#6FFF00]" data-testid="back-to-demo" onClick={onBack}>
            Back to samples
          </Button>
        </div>
      ) : !onMonad ? (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">
            This pocket only lives on Monad. Switch the wallet over to see your Chog.
          </p>
          <Button
            type="button"
            size="xl"
            onClick={() => void switchChain.mutateAsync({ chainId: monad.id }).catch(() => setConnectError("The wallet did not switch to Monad."))}
          >
            Switch to Monad
          </Button>
          {connectError ? <p className="text-sm text-[#EFF4FF]/70">{connectError}</p> : null}
          <Button type="button" variant="ghost" className="font-anton uppercase text-[#6FFF00]" onClick={onBack}>
            Back to samples
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {balance.isError ? (
            <div className="space-y-2" data-testid="chain-error">
              <p className="text-sm">Could not read $CHOG from Monad. Try again in a moment.</p>
              <Button type="button" variant="outline" onClick={() => void balance.refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <p className="text-sm" data-testid="wallet-amount">
              {balance.isPending ? "Reading your $CHOG…" : `${formatChog(balance.data ?? 0n)} $CHOG in hand`}
            </p>
          )}

          {held.data === 0n ? (
            <p className="text-sm leading-relaxed" data-testid="no-chog">
              This wallet does not hold a Chog from the collection. The pocket
              needs that NFT. You can go back to the sample Chogs.
            </p>
          ) : null}

          {progress ? (
            <p className="text-sm" data-testid="scan-status">
              Looking for your Chogs… {progress.checked} of {progress.total} checked.
            </p>
          ) : null}
          {scanError ? <p className="text-sm text-[#EFF4FF]/70">{scanError}</p> : null}

          {found.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto">
              {found.map((id) => (
                <Button key={id} type="button" size="sm" variant="outline" onClick={() => void openToken(id)}>
                  Token {id}
                </Button>
              ))}
            </div>
          ) : null}

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const id = Number(tokenInput);
              if (!Number.isInteger(id) || id <= 0) {
                setPetError("Type the token id number.");
                return;
              }
              void openToken(id);
            }}
          >
            <label className="sr-only" htmlFor="token-id">
              Token id
            </label>
            <Input
              id="token-id"
              data-testid="token-id"
              inputMode="numeric"
              placeholder="Token id"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
            />
            <Button type="submit" variant="outline">
              Open
            </Button>
          </form>
          <p className="text-xs leading-relaxed text-[#EFF4FF]/60">
            The number in the picture title can differ from the token id. Use the
            id from the collection page, or let the search find it.
          </p>
          {petError ? (
            <p className="text-sm" data-testid="pet-error">
              {petError}
            </p>
          ) : null}
          {busy ? <p className="text-sm">{busy}</p> : null}

          <Button type="button" variant="ghost" className="font-anton uppercase text-[#6FFF00]" data-testid="back-to-demo" onClick={onBack}>
            Back to samples
          </Button>
        </div>
      )}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-auto lg:pt-10">
        <div className="rounded-[20px] border border-white/10 bg-[#010828]/40 p-4">
          <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">Network</p>
          <p className="font-anton mt-2 text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>Monad</p>
          <p className="mt-1 text-sm leading-relaxed text-[#EFF4FF]/70">Chain 143. This pocket reads $CHOG and the Chog you hold. No other chain.</p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-[#010828]/40 p-4">
          <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">Wallets</p>
          <p className="font-anton mt-2 text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>Injected</p>
          <p className="mt-1 text-sm leading-relaxed text-[#EFF4FF]/70">MetaMask, Rabby, and other browser wallets that can add Monad. Demo mode needs none of them.</p>
        </div>
      </div>
      </div>
    </div>
  );
}
