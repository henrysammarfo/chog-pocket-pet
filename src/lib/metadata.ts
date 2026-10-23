import type { TraitMap } from "@/lib/personality";

export type NftAttribute = {
  trait_type?: string;
  value?: string | number;
};

export type NftMetadata = {
  name?: string;
  image?: string;
  description?: string;
  attributes?: NftAttribute[];
};

export const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://w3s.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
];

/** Subdomain gateway first, then path gateways. `ipfs://cid/1.json` → `https://cid.ipfs.dweb.link/1.json`. */
export function ipfsCandidates(uri: string): string[] {
  if (!uri.startsWith("ipfs://")) return [uri];
  const path = uri.slice("ipfs://".length).replace(/^ipfs\//, "");
  const slash = path.indexOf("/");
  const cid = slash === -1 ? path : path.slice(0, slash);
  const rest = slash === -1 ? "" : path.slice(slash);
  return [
    `https://${cid}.ipfs.dweb.link${rest}`,
    ...IPFS_GATEWAYS.map((gateway) => `${gateway}${path}`),
  ];
}

export function traitsFromMetadata(meta: NftMetadata): TraitMap {
  const traits: TraitMap = {};
  for (const attr of meta.attributes ?? []) {
    if (!attr.trait_type) continue;
    if (attr.value === undefined || attr.value === null) continue;
    const value = String(attr.value).trim();
    if (!value) continue;
    traits[attr.trait_type] = value;
  }
  return traits;
}

export function ipfsToHttp(uri: string, gateway: string): string {
  if (!uri.startsWith("ipfs://")) return uri;
  const path = uri.slice("ipfs://".length).replace(/^ipfs\//, "");
  return `${gateway}${path}`;
}

export async function loadTokenMetadata(tokenUri: string): Promise<{
  name: string;
  imageUrl: string | null;
  traits: TraitMap;
}> {
  let lastError: unknown;
  for (const url of ipfsCandidates(tokenUri)) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
      if (!response.ok) throw new Error(`Picture data returned ${response.status}`);
      const meta = (await response.json()) as NftMetadata;
      const image = meta.image ? ipfsCandidates(meta.image)[0] : null;
      return {
        name: meta.name?.trim() || "Chog",
        imageUrl: image,
        traits: traitsFromMetadata(meta),
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("The picture data did not load.");
}
