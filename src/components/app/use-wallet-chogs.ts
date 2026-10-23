"use client";

import { useEffect, useState } from "react";
import { monad } from "viem/chains";
import {
  useConnect,
  useConnection,
  useConnectors,
  useDisconnect,
  useReadContract,
  useSwitchChain,
} from "wagmi";
import { erc20Abi, erc721Abi } from "@/lib/abi";
import { chogNftAddress, chogTokenAddress } from "@/lib/config";
import { readOwnedPet } from "@/lib/read-pet";
import type { ChogPet } from "@/lib/pets";
import { scanOwnedChogs } from "@/lib/scan-chogs";

export function useWalletChogs() {
  const connection = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();
  const address = connection.address;
  const onMonad = connection.chainId === monad.id;
  const token = chogTokenAddress();
  const nft = chogNftAddress();

  const balance = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && onMonad) },
  });
  const held = useReadContract({
    address: nft,
    abi: erc721Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && onMonad) },
  });
  const supply = useReadContract({
    address: nft,
    abi: erc721Abi,
    functionName: "totalSupply",
    query: { enabled: Boolean(address && onMonad && held.data !== undefined && held.data > 0n) },
  });

  const [connectError, setConnectError] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [found, setFound] = useState<number[]>([]);
  const [progress, setProgress] = useState<{ checked: number; total: number } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedFor, setScannedFor] = useState<string | null>(null);
  const [pet, setPet] = useState<ChogPet | null>(null);
  const [petError, setPetError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !onMonad) return;
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
      .then((ids) => {
        if (controller.signal.aborted) return;
        setFound(ids);
        setScannedFor(owner);
        setProgress(null);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setScanError("The search stopped early. Type a token id if you have it.");
        setProgress(null);
      });
    return () => controller.abort();
  }, [address, onMonad, held.data, supply.data, scannedFor]);

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

  async function switchToMonad() {
    setSwitchError(null);
    try {
      await switchChain.mutateAsync({ chainId: monad.id });
    } catch {
      setSwitchError("The wallet did not switch to Monad.");
    }
  }

  async function openToken(raw: number) {
    if (!address) return;
    setPetError(null);
    setBusy("Opening this Chog…");
    try {
      const next = await readOwnedPet(raw, address);
      setPet(next);
      return next;
    } catch (error) {
      setPet(null);
      setPetError(error instanceof Error ? error.message : "That Chog did not open.");
      return null;
    } finally {
      setBusy(null);
    }
  }

  return {
    connection,
    address,
    onMonad,
    balance,
    held,
    found,
    progress,
    scanError,
    connectError,
    switchError,
    pet,
    petError,
    busy,
    connectWallet,
    switchToMonad,
    openToken,
    disconnect: () => disconnect.mutate(),
  };
}
