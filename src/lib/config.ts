/**
 * Addresses the pocket reads on Monad mainnet (chain id 143).
 *
 * $CHOG token: printed on the official Chog site, https://chog.xyz/
 * Chog Genesis NFT: NOT printed on chog.xyz. This default is the OpenSea-verified
 * "Chog Genesis" collection (1,969 pictures, each with traits) at the address
 * Monadscan shows for that contract. Override it before a public deploy if the
 * Chog team names a different collection.
 */

const ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export const MONAD_CHAIN_ID = 143;

export const CHOG_TOKEN_ADDRESS_OFFICIAL = true;
export const CHOG_NFT_ADDRESS_OFFICIAL = false;

export const DEFAULT_CHOG_TOKEN =
  "0x350035555E10d9AfAF1566AaebfCeD5BA6C27777" as const;
export const DEFAULT_CHOG_NFT =
  "0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763" as const;
export const DEFAULT_JAR_ADDRESS =
  "0xf8Ae354fa05f315B81F2296D541021068CbbECde" as const;

function fromEnv(name: string, fallback: `0x${string}`): `0x${string}` {
  const raw = process.env[name]?.trim();
  if (raw && ADDRESS.test(raw)) return raw as `0x${string}`;
  return fallback;
}

export function chogTokenAddress(): `0x${string}` {
  return fromEnv("NEXT_PUBLIC_CHOG_TOKEN_ADDRESS", DEFAULT_CHOG_TOKEN);
}

export function chogNftAddress(): `0x${string}` {
  return fromEnv("NEXT_PUBLIC_CHOG_NFT_ADDRESS", DEFAULT_CHOG_NFT);
}

export function jarAddress(): `0x${string}` | null {
  const raw = process.env.NEXT_PUBLIC_JAR_ADDRESS?.trim();
  const pick = raw && ADDRESS.test(raw) ? raw : DEFAULT_JAR_ADDRESS;
  if (pick.toLowerCase() === "0x0000000000000000000000000000000000000000") {
    return null;
  }
  return pick as `0x${string}`;
}

export function monadRpcUrl(): string {
  const raw = process.env.NEXT_PUBLIC_MONAD_RPC_URL?.trim();
  return raw || "https://rpc.monad.xyz";
}

export const MONADSCAN = "https://monadscan.com";
