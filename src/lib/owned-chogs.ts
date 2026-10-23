import { parseAbiItem, type Address } from "viem";
import { erc721Abi } from "@/lib/abi";
import { chogNftAddress } from "@/lib/config";
import { monadClient } from "@/lib/scan-chogs";

export const GENESIS_METADATA_CID =
  "bafybeid4ybujnscdipkno7ps5utqelp5ry5ryreqhay3zhgk3a6x4jruqu";

export function genesisTokenUri(tokenId: number): string {
  return `ipfs://${GENESIS_METADATA_CID}/${tokenId}.json`;
}

const enumerableAbi = [
  {
    type: "function",
    name: "tokenOfOwnerByIndex",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
] as const;

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
);

/** Net token ids still held after inbound and outbound transfers. */
export function idsFromTransfers(received: bigint[], sent: bigint[]): number[] {
  const count = new Map<string, number>();
  for (const id of received) {
    const key = id.toString();
    count.set(key, (count.get(key) ?? 0) + 1);
  }
  for (const id of sent) {
    const key = id.toString();
    count.set(key, (count.get(key) ?? 0) - 1);
  }
  return [...count.entries()]
    .filter(([, held]) => held > 0)
    .map(([id]) => Number(id))
    .sort((a, b) => a - b);
}

export async function findOwnedTokenIds(owner: Address): Promise<number[]> {
  const client = monadClient();
  const nft = chogNftAddress();
  const balance = await client.readContract({
    address: nft,
    abi: erc721Abi,
    functionName: "balanceOf",
    args: [owner],
  });
  const count = Number(balance);
  if (!Number.isFinite(count) || count <= 0) return [];
  const cap = Math.min(count, 24);
  const indexed = await client.multicall({
    allowFailure: true,
    contracts: Array.from({ length: cap }, (_, index) => ({
      address: nft,
      abi: enumerableAbi,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [owner, BigInt(index)] as const,
    })),
  });
  if (indexed.length > 0 && indexed.every((row) => row.status === "success")) {
    return indexed.map((row) => Number(row.result));
  }
  const [inbound, outbound] = await Promise.all([
    client.getLogs({ address: nft, event: transferEvent, args: { to: owner }, fromBlock: 0n }),
    client.getLogs({ address: nft, event: transferEvent, args: { from: owner }, fromBlock: 0n }),
  ]);
  const candidates = idsFromTransfers(
    inbound.map((log) => log.args.tokenId ?? 0n),
    outbound.map((log) => log.args.tokenId ?? 0n),
  ).slice(0, 24);
  if (candidates.length === 0) return [];
  const checks = await client.multicall({
    allowFailure: true,
    contracts: candidates.map((id) => ({
      address: nft,
      abi: erc721Abi,
      functionName: "ownerOf" as const,
      args: [BigInt(id)] as const,
    })),
  });
  return candidates.filter((id, index) => {
    const row = checks[index];
    return row?.status === "success" && String(row.result).toLowerCase() === owner.toLowerCase();
  });
}
