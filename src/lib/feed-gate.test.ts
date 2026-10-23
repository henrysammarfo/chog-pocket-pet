import { describe, expect, it } from "vitest";
import { assessFeed, mapJarError } from "@/lib/feed-gate";
import { idsFromTransfers } from "@/lib/owned-chogs";
import { MIN_FEED } from "@/lib/savings";

const fifty = MIN_FEED;
const hundred = 100n * 10n ** 18n;

describe("genesis and $CHOG gate", () => {
  it("stops before a transaction when the wallet holds no Genesis Chog", () => {
    const block = assessFeed({
      nftBalance: 0n,
      chogBalance: 10_000n * 10n ** 18n,
      allowance: hundred,
      amount: hundred,
    });
    expect(block.kind).toBe("no-nft");
  });

  it("stops when $CHOG is under the 50 minimum", () => {
    const block = assessFeed({
      nftBalance: 1n,
      chogBalance: 40n * 10n ** 18n,
      allowance: 0n,
      amount: fifty,
    });
    expect(block).toMatchObject({ kind: "low-chog", need: fifty });
  });

  it("asks for approval only after the Genesis and balance checks pass", () => {
    expect(
      assessFeed({
        nftBalance: 2n,
        chogBalance: hundred,
        allowance: fifty,
        amount: hundred,
      }),
    ).toEqual({ kind: "ok", needsApproval: true });
    expect(
      assessFeed({
        nftBalance: 1n,
        chogBalance: hundred,
        allowance: hundred,
        amount: hundred,
      }),
    ).toEqual({ kind: "ok", needsApproval: false });
  });

  it("refuses an amount under the jar minimum even when the wallet is funded", () => {
    const block = assessFeed({
      nftBalance: 1n,
      chogBalance: hundred,
      allowance: hundred,
      amount: 1n,
    });
    expect(block.kind).toBe("message");
  });
});

describe("owned genesis ids", () => {
  it("keeps tokens received and not later sent", () => {
    expect(idsFromTransfers([1n, 2n, 3n], [2n])).toEqual([1, 3]);
    expect(idsFromTransfers([4n, 4n], [4n])).toEqual([4]);
  });
});

describe("jar error copy", () => {
  it("maps the contract errors to plain sentences", () => {
    expect(mapJarError(new Error("execution reverted: NotYourChog()"))).toMatch(/not a Chog Genesis/);
    expect(mapJarError({ shortMessage: "AmountTooSmall(10, 50)" })).toMatch(/50 \$CHOG/);
    expect(mapJarError({ message: "EnforcedPause()" })).toMatch(/paused/);
    expect(mapJarError({ message: "BadAmount()" })).toMatch(/not in your jar/);
    expect(mapJarError(new Error("User rejected the request."))).toMatch(/Nothing moved/);
  });
});
