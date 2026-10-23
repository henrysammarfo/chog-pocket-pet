import type { Address } from "viem";
import { erc721Abi } from "@/lib/abi";
import { chogNftAddress } from "@/lib/config";
import { loadTokenMetadata } from "@/lib/metadata";
import { genesisTokenUri } from "@/lib/owned-chogs";
import { monadClient } from "@/lib/scan-chogs";
import type { ChogPet } from "@/lib/pets";

export async function readChog(tokenId: number): Promise<ChogPet> {
  const client = monadClient();
  const nft = chogNftAddress();
  let uri = genesisTokenUri(tokenId);
  try {
    const onChain = await client.readContract({
      address: nft,
      abi: erc721Abi,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    });
    if (onChain.startsWith("ipfs://") || onChain.startsWith("http")) uri = onChain;
  } catch {
    uri = genesisTokenUri(tokenId);
  }
  let meta;
  try {
    meta = await loadTokenMetadata(uri);
  } catch {
    throw new Error("The traits did not load. Try that Chog again.");
  }
  return {
    id: `token-${tokenId}`,
    name: meta.name,
    tokenId,
    imageUrl: meta.imageUrl,
    traits: meta.traits,
    sample: false,
  };
}

export async function readOwnedPet(tokenId: number, owner: Address): Promise<ChogPet> {
  const client = monadClient();
  const nft = chogNftAddress();
  let onChainOwner: string;
  try {
    onChainOwner = await client.readContract({
      address: nft,
      abi: erc721Abi,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });
  } catch {
    throw new Error("That token id is not a Chog in this collection.");
  }
  if (onChainOwner.toLowerCase() !== owner.toLowerCase()) {
    throw new Error("That Chog is not in this wallet.");
  }
  const uri = await client.readContract({
    address: nft,
    abi: erc721Abi,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  });
  let meta;
  try {
    meta = await loadTokenMetadata(uri);
  } catch {
    throw new Error("The traits did not load. Try that Chog again.");
  }
  return {
    id: `token-${tokenId}`,
    name: meta.name,
    tokenId,
    imageUrl: meta.imageUrl,
    traits: meta.traits,
    sample: false,
  };
}
