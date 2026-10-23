import { formatChog } from "@/lib/format";
import { MIN_FEED } from "@/lib/savings";

export const OPENSEA_GENESIS = "https://opensea.io/collection/chog-genesis";
/** LCX Liberty DEX buy page for the official $CHOG contract on Monad. */
export const CHOG_BUY_URL = "https://dex.lcx.com/how-to-buy/chog";
export const CHOG_TOKEN_PAGE =
  "https://monadscan.com/token/0x350035555E10d9AfAF1566AaebfCeD5BA6C27777";

export type FeedBlock =
  | { kind: "ok"; needsApproval: boolean }
  | { kind: "no-nft" }
  | { kind: "low-chog"; have: bigint; need: bigint }
  | { kind: "message"; text: string };

export function assessFeed(input: {
  nftBalance: bigint;
  chogBalance: bigint;
  allowance: bigint;
  amount: bigint;
  minFeed?: bigint;
}): FeedBlock {
  const minFeed = input.minFeed ?? MIN_FEED;
  if (input.nftBalance <= 0n) return { kind: "no-nft" };
  if (input.amount < minFeed) {
    return {
      kind: "message",
      text: `The smallest set-aside is ${formatChog(minFeed)} $CHOG.`,
    };
  }
  if (input.chogBalance < input.amount) {
    return { kind: "low-chog", have: input.chogBalance, need: input.amount };
  }
  return { kind: "ok", needsApproval: input.allowance < input.amount };
}

function errorText(error: unknown): string {
  const parts: string[] = [];
  const walk = (value: unknown, depth: number) => {
    if (value == null || depth > 5) return;
    if (typeof value === "string") {
      parts.push(value);
      return;
    }
    if (typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    for (const key of ["shortMessage", "message", "details", "reason", "name"]) {
      if (typeof record[key] === "string") parts.push(record[key] as string);
    }
    if ("cause" in record) walk(record.cause, depth + 1);
  };
  walk(error, 0);
  return parts.join(" ");
}

/** Plain sentences for the jar's custom errors and the wallet rejections around them. */
export function mapJarError(error: unknown): string {
  const text = errorText(error);
  if (/user rejected|user denied|rejected the request/i.test(text)) {
    return "The wallet closed the request. Nothing moved.";
  }
  if (/NotYourChog/i.test(text)) {
    return "That picture is not a Chog Genesis in this wallet. Only a Chog you hold can be fed.";
  }
  if (/AmountTooSmall/i.test(text)) {
    return "That amount is below the 50 $CHOG minimum, so nothing was set aside.";
  }
  if (/BadAmount/i.test(text)) {
    return "That amount is not in your jar, so nothing was sent back.";
  }
  if (/EnforcedPause|paused/i.test(text)) {
    return "New set-asides are paused. You can still take your own $CHOG back.";
  }
  if (/EthNotAccepted/i.test(text)) {
    return "The jar does not take MON. It only holds $CHOG.";
  }
  if (/insufficient funds for gas|intrinsic gas too low/i.test(text)) {
    return "The wallet needs a little MON for the network fee. No $CHOG moved.";
  }
  if (/insufficient|ERC20InsufficientBalance|transfer amount exceeds balance/i.test(text)) {
    return "This wallet does not hold enough $CHOG for that set-aside.";
  }
  if (/ERC20InsufficientAllowance|insufficient allowance/i.test(text)) {
    return "The jar is not allowed to move that $CHOG yet. Approve it, then try again.";
  }
  return "Monad did not accept that move. Nothing was set aside.";
}
