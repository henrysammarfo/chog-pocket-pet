"use client";

import { useState } from "react";
import { monad } from "viem/chains";
import { useConnection, useWriteContract } from "wagmi";
import { AppProviders } from "@/components/app/providers";
import { erc20Abi, erc721Abi, jarAbi } from "@/lib/abi";
import { chogNftAddress, chogTokenAddress, jarAddress } from "@/lib/config";
import {
  assessFeed,
  CHOG_BUY_URL,
  CHOG_TOKEN_PAGE,
  mapJarError,
  OPENSEA_GENESIS,
  type FeedBlock,
} from "@/lib/feed-gate";
import { formatChog } from "@/lib/format";
import type { ChogPet } from "@/lib/pets";
import { monadClient } from "@/lib/scan-chogs";
import { MIN_FEED } from "@/lib/savings";

export function FeedButton(props: {
  label: string;
  disabled?: boolean;
  className: string;
  pet: ChogPet;
  amount: bigint;
  onDemo: () => boolean;
  onDone?: () => void;
}) {
  return (
    <AppProviders>
      <FeedButtonInner {...props} />
    </AppProviders>
  );
}

function FeedButtonInner({
  label,
  disabled,
  className,
  pet,
  amount,
  onDemo,
  onDone,
}: {
  label: string;
  disabled?: boolean;
  className: string;
  pet: ChogPet;
  amount: bigint;
  onDemo: () => boolean;
  onDone?: () => void;
}) {
  const connection = useConnection();
  const write = useWriteContract();
  const [busy, setBusy] = useState<string | null>(null);
  const [block, setBlock] = useState<FeedBlock | null>(null);
  const [doneHash, setDoneHash] = useState<string | null>(null);

  async function onClick() {
    const onChain =
      connection.isConnected &&
      connection.chainId === monad.id &&
      connection.address &&
      pet.tokenId != null &&
      !pet.sample;
    if (!onChain) {
      setBlock(null);
      if (onDemo()) onDone?.();
      return;
    }
    const account = connection.address;
    const tokenId = pet.tokenId;
    if (tokenId == null) return;
    const jar = jarAddress();
    setBlock(null);
    setBusy("Checking your Chog and $CHOG…");
    try {
      if (!jar) {
        setBlock({ kind: "message", text: "The jar address is not set, so no transaction was sent." });
        return;
      }
      const client = monadClient();
      const token = chogTokenAddress();
      const nft = chogNftAddress();
      const [nftBalance, chogBalance, allowance] = await Promise.all([
        client.readContract({ address: nft, abi: erc721Abi, functionName: "balanceOf", args: [account] }),
        client.readContract({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [account] }),
        client.readContract({
          address: token,
          abi: erc20Abi,
          functionName: "allowance",
          args: [account, jar],
        }),
      ]);
      const gate = assessFeed({ nftBalance, chogBalance, allowance, amount, minFeed: MIN_FEED });
      if (gate.kind !== "ok") {
        setBlock(gate);
        return;
      }
      try {
        await client.simulateContract({
          address: jar,
          abi: jarAbi,
          functionName: "feed",
          args: [BigInt(tokenId), amount],
          account,
        });
      } catch (error) {
        setBlock({ kind: "message", text: mapJarError(error) });
        return;
      }
      if (gate.needsApproval) {
        setBusy("Asking the wallet to allow the jar…");
        const approved = await write.mutateAsync({
          address: token,
          abi: erc20Abi,
          functionName: "approve",
          args: [jar, amount],
        });
        await client.waitForTransactionReceipt({ hash: approved });
      }
      setBusy("Setting $CHOG aside…");
      const hash = await write.mutateAsync({
        address: jar,
        abi: jarAbi,
        functionName: "feed",
        args: [BigInt(tokenId), amount],
      });
      await client.waitForTransactionReceipt({ hash });
      setDoneHash(hash);
    } catch (error) {
      setBlock({ kind: "message", text: mapJarError(error) });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <button type="button" data-testid="feed-button" className={className} disabled={disabled || busy !== null} onClick={() => void onClick()}>
        {busy ?? label}
      </button>
      <FeedBlockCard block={block} />
      {doneHash ? (
        <p className="text-center text-sm text-[#6FFF00]" data-testid="feed-sent">
          Set aside on Monad.{" "}
          <a className="underline" href={`https://monadscan.com/tx/${doneHash}`} target="_blank" rel="noreferrer">
            View the transaction
          </a>
        </p>
      ) : null}
    </div>
  );
}

export function FeedBlockCard({ block }: { block: FeedBlock | null }) {
  if (!block || block.kind === "ok") return null;
  if (block.kind === "no-nft") {
    return (
      <article className="rounded-[var(--radius-18)] border border-[#F5B942]/40 bg-[#F5B942]/10 p-4 text-sm leading-relaxed" data-testid="feed-no-nft">
        <p className="font-anton text-lg uppercase text-[#F5B942]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          A Chog Genesis is required
        </p>
        <p className="mt-2 text-[#EFF4FF]/85">
          This wallet does not hold a Chog Genesis, so nothing was sent. The sample pet, the arcade, and the leaderboard still work on this phone.
        </p>
        <a className="mt-3 inline-block text-[#6FFF00] underline" href={OPENSEA_GENESIS} target="_blank" rel="noreferrer">
          Chog Genesis on OpenSea
        </a>
      </article>
    );
  }
  if (block.kind === "low-chog") {
    return (
      <article className="rounded-[var(--radius-18)] border border-[#F4845F]/40 bg-[#F4845F]/10 p-4 text-sm leading-relaxed" data-testid="feed-low-chog">
        <p className="font-anton text-lg uppercase text-[#F4845F]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          Not enough $CHOG
        </p>
        <p className="mt-2 text-[#EFF4FF]/85">
          This set-aside needs {formatChog(block.need)} $CHOG. The wallet holds {formatChog(block.have)}. The minimum is 50. No transaction was sent.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <a className="text-[#6FFF00] underline" href={CHOG_BUY_URL} target="_blank" rel="noreferrer">
            Buy $CHOG on a Monad DEX
          </a>
          <a className="text-[#6FFF00] underline" href={CHOG_TOKEN_PAGE} target="_blank" rel="noreferrer">
            $CHOG on Monadscan
          </a>
        </div>
      </article>
    );
  }
  return (
    <p className="text-center text-sm text-[#EFF4FF]/80" data-testid="feed-message">
      {block.text}
    </p>
  );
}
