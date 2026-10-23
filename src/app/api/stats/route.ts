import { createPublicClient, http, parseAbiItem, formatUnits } from "viem";
import { monad } from "viem/chains";

import { connection } from "next/server";

const JAR = (process.env.NEXT_PUBLIC_JAR_ADDRESS || "0xf8Ae354fa05f315B81F2296D541021068CbbECde") as `0x${string}`;
const NFT = "0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763" as const;
const CHOG = "0x350035555E10d9AfAF1566AaebfCeD5BA6C27777" as const;
const DEPLOY_BLOCK = BigInt(115892488);
const STEP = BigInt(100);
const RPCS = ["https://rpc-mainnet.monadinfra.com", "https://rpc1.monad.xyz"];

const fed = parseAbiItem("event Fed(address indexed owner, uint256 indexed tokenId, uint256 amount, uint32 streak, uint64 day)");
const withdrawn = parseAbiItem("event Withdrawn(address indexed owner, uint256 amount, uint256 remaining)");

type Pocket = { owner: string; tokenId: number; fed: bigint; withdrawn: bigint; streak: number; feeds: number; lastDay: number };
const cache: { scanned: bigint; pockets: Map<string, Pocket>; at: number; body?: unknown } = {
  scanned: DEPLOY_BLOCK - BigInt(1),
  pockets: new Map(),
  at: 0,
};

function client(i = 0) {
  return createPublicClient({ chain: monad, transport: http(RPCS[i % RPCS.length]) });
}

async function scan(head: bigint) {
  const ranges: [bigint, bigint][] = [];
  for (let from = cache.scanned + BigInt(1); from <= head; from += STEP) {
    const to = from + STEP - BigInt(1) > head ? head : from + STEP - BigInt(1);
    ranges.push([from, to]);
  }
  for (let i = 0; i < ranges.length; i += 25) {
    const batch = ranges.slice(i, i + 25);
    const results = await Promise.all(
      batch.map(([fromBlock, toBlock], k) =>
        client(k).getLogs({ address: JAR, events: [fed, withdrawn], fromBlock, toBlock }),
      ),
    );
    for (const logs of results) {
      for (const log of logs) {
        const owner = (log.args as { owner: string }).owner.toLowerCase();
        const p = cache.pockets.get(owner) ?? { owner, tokenId: 0, fed: BigInt(0), withdrawn: BigInt(0), streak: 0, feeds: 0, lastDay: 0 };
        if (log.eventName === "Fed") {
          const a = log.args as { tokenId: bigint; amount: bigint; streak: number; day: bigint };
          p.fed += a.amount;
          p.tokenId = Number(a.tokenId);
          p.streak = Number(a.streak);
          p.lastDay = Number(a.day);
          p.feeds += 1;
        } else {
          p.withdrawn += (log.args as { amount: bigint }).amount;
        }
        cache.pockets.set(owner, p);
      }
    }
    cache.scanned = batch[batch.length - 1][1];
  }
}

export async function GET() {
  await connection();
  if (cache.body && Date.now() - cache.at < 30_000) return Response.json(cache.body);
  try {
    const c = client();
    const head = await c.getBlockNumber();
    const erc20 = [{ type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] }] as const;
    const supplyAbi = [{ type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] }] as const;
    const [jarBalance, supply] = await Promise.all([
      c.readContract({ address: CHOG, abi: erc20, functionName: "balanceOf", args: [JAR] }),
      c.readContract({ address: NFT, abi: supplyAbi, functionName: "totalSupply" }).catch(() => null),
    ]);
    await scan(head);
    const pockets = [...cache.pockets.values()];
    const totalFed = pockets.reduce((s, p) => s + p.fed, BigInt(0));
    const body = {
      live: true,
      block: head.toString(),
      genesisSupply: supply === null ? null : Number(supply),
      jarBalance: formatUnits(jarBalance, 18),
      totalFed: formatUnits(totalFed, 18),
      feeders: pockets.filter((p) => p.feeds > 0).length,
      feeds: pockets.reduce((s, p) => s + p.feeds, 0),
      pockets: pockets
        .filter((p) => p.feeds > 0)
        .map((p) => ({
          owner: p.owner,
          tokenId: p.tokenId,
          saved: formatUnits(p.fed - p.withdrawn, 18),
          fed: formatUnits(p.fed, 18),
          streak: p.streak,
          feeds: p.feeds,
          lastDay: p.lastDay,
        })),
    };
    cache.body = body;
    cache.at = Date.now();
    return Response.json(body);
  } catch (error) {
    return Response.json({ live: false, error: String(error).slice(0, 200) }, { status: 503 });
  }
}
