import { createPublicClient, http, type Address } from "viem";
import { monad } from "viem/chains";
import { erc721Abi } from "@/lib/abi";
import { chogNftAddress, monadRpcUrl } from "@/lib/config";
import { chunkTokenIds, keepOwned } from "@/lib/scan-plan";

const CHUNK = 300;

export function monadClient() {
  return createPublicClient({
    chain: monad,
    transport: http(monadRpcUrl()),
  });
}

export async function scanOwnedChogs(input: {
  owner: Address;
  supply: number;
  onProgress?: (checked: number, supply: number) => void;
  signal?: AbortSignal;
}): Promise<number[]> {
  const client = monadClient();
  const nft = chogNftAddress();
  const found: number[] = [];
  const chunks = chunkTokenIds(input.supply, CHUNK);
  let checked = 0;
  for (const ids of chunks) {
    if (input.signal?.aborted) break;
    const rows = await client.multicall({
      allowFailure: true,
      contracts: ids.map((id) => ({
        address: nft,
        abi: erc721Abi,
        functionName: "ownerOf" as const,
        args: [BigInt(id)] as const,
      })),
    });
    const owners = rows.map((row) =>
      row.status === "success" ? (row.result as string) : null,
    );
    found.push(...keepOwned(ids, owners, input.owner));
    checked += ids.length;
    input.onProgress?.(checked, input.supply);
  }
  return found;
}
