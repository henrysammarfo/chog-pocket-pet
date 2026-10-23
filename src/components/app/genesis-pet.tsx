"use client";

import { useEffect, useState } from "react";
import { monad } from "viem/chains";
import { useConnection } from "wagmi";
import { AppProviders } from "@/components/app/providers";
import { OPENSEA_GENESIS } from "@/lib/feed-gate";
import { setHeldPet } from "@/lib/held-pet";
import { findOwnedTokenIds } from "@/lib/owned-chogs";
import type { ChogPet } from "@/lib/pets";
import { readChog } from "@/lib/read-pet";

export function GenesisPet() {
  return (
    <AppProviders>
      <GenesisPetInner />
    </AppProviders>
  );
}

function GenesisPetInner() {
  const connection = useConnection();
  const address = connection.address;
  const onMonad = connection.isConnected && connection.chainId === monad.id;
  const [ids, setIds] = useState<number[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "none" | "ready" | "error">("idle");
  const [note, setNote] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [shown, setShown] = useState<ChogPet | null>(null);

  useEffect(() => {
    if (!onMonad || !address) return;
    let cancel = false;
    const timer = window.setTimeout(() => {
      if (cancel) return;
      setStatus("loading");
      setNote(null);
    }, 0);
    findOwnedTokenIds(address)
      .then(async (found) => {
        if (cancel) return;
        setIds(found);
        if (found.length === 0) {
          setHeldPet(null);
          setShown(null);
          setStatus("none");
          return;
        }
        const pet = await readChog(found[0]);
        if (cancel) return;
        setHeldPet(pet);
        setShown(pet);
        setStatus("ready");
      })
      .catch(() => {
        if (cancel) return;
        setStatus("error");
        setNote("Monad did not list this wallet's Chogs. Type a number below.");
      });
    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, [address, onMonad]);

  async function viewNumber(raw: string) {
    const tokenId = Number(raw.trim());
    if (!Number.isInteger(tokenId) || tokenId < 0) {
      setNote("Type a whole token number.");
      return;
    }
    setNote(null);
    setStatus("loading");
    try {
      const pet = await readChog(tokenId);
      setHeldPet(pet);
      setShown(pet);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setNote(error instanceof Error ? error.message : "That Chog did not open.");
    }
  }

  const traits = Object.entries(shown?.traits ?? {}).slice(0, 6);

  return (
    <section className="liquid-glass flex flex-col gap-3 rounded-[var(--radius-24)] p-4" data-testid="genesis-pet">
      <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Your Chog</p>
      {status === "loading" ? <p className="text-sm text-[#EFF4FF]/75">Reading Chog Genesis…</p> : null}
      {status === "none" ? (
        <article className="rounded-[var(--radius-18)] border border-[#F5B942]/40 bg-[#F5B942]/10 p-4 text-sm leading-relaxed" data-testid="no-genesis">
          <p>This wallet does not hold a Chog Genesis. The sample pet stays on stage so the arcade and the jar demo still work.</p>
          <a className="mt-2 inline-block text-[#6FFF00] underline" href={OPENSEA_GENESIS} target="_blank" rel="noreferrer">
            Chog Genesis on OpenSea
          </a>
        </article>
      ) : null}
      {ids.length > 1 ? (
        <div className="flex flex-wrap gap-2" data-testid="chog-picker">
          {ids.map((id) => (
            <button
              key={id}
              type="button"
              className="font-anton h-10 rounded-full border border-white/25 px-3 text-xs uppercase"
              onClick={() => void viewNumber(String(id))}
            >
              #{id}
            </button>
          ))}
        </div>
      ) : null}
      {traits.length > 0 ? (
        <ul className="flex flex-wrap gap-2 text-xs text-[#EFF4FF]/80" data-testid="pet-traits">
          {traits.map(([name, value]) => (
            <li key={name} className="rounded-full border border-white/15 px-2 py-1">
              {name}: {value}
            </li>
          ))}
        </ul>
      ) : null}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void viewNumber(tokenInput);
        }}
      >
        <label className="sr-only" htmlFor="chog-number">
          View any Chog by number
        </label>
        <input
          id="chog-number"
          data-testid="chog-number"
          inputMode="numeric"
          value={tokenInput}
          onChange={(event) => setTokenInput(event.target.value)}
          placeholder="View any Chog by number"
          className="h-12 min-w-0 flex-1 rounded-full border border-white/20 bg-transparent px-4 text-sm"
        />
        <button type="submit" className="font-anton h-12 rounded-full bg-[#6FFF00] px-4 text-sm uppercase text-[#010828]">
          View
        </button>
      </form>
      {note ? <p className="text-sm text-[#EFF4FF]/75">{note}</p> : null}
    </section>
  );
}
