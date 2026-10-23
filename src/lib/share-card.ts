import { CHOG_UNIT } from "@/lib/format";

const SAMPLE_NUMBERS: Record<string, number> = {
  bubblegum: 11,
  laser: 22,
  crown: 33,
  quiet: 44,
};

export function shareTokenNumber(id: string, tokenId: number | null): number {
  if (tokenId != null) return tokenId;
  return SAMPLE_NUMBERS[id] ?? 0;
}

export function commaWhole(amount: bigint): string {
  const whole = amount / CHOG_UNIT;
  return new Intl.NumberFormat("en-US").format(whole);
}

export function shareLine(tokenId: number, streak: number, saved: bigint): string {
  const days = streak === 1 ? "1-day streak" : `${streak}-day streak`;
  return `Chog #${tokenId} · ${days} · ${commaWhole(saved)} $CHOG saved`;
}

export function shareIntent(line: string, pageUrl: string): string {
  const url = new URL("https://x.com/intent/tweet");
  url.searchParams.set("text", line);
  url.searchParams.set("url", pageUrl);
  return url.toString();
}

export function shareCardPath(tokenId: number, streak: number, saved: bigint): string {
  const params = new URLSearchParams({
    token: String(tokenId),
    streak: String(streak),
    saved: commaWhole(saved),
  });
  return `/share/card?${params.toString()}`;
}
