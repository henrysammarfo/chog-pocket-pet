import { describe, expect, it } from "vitest";
import { pocketDay, shiftFeedDay, skipAhead } from "@/lib/demo-clock";
import { CHOG_UNIT } from "@/lib/format";
import { buildBoard } from "@/lib/leaderboard";
import { blankMemory, creditMemory, memoryKey } from "@/lib/memory";
import { freshPocket, tryFeed } from "@/lib/savings";
import { coverMiss, missedOneDay } from "@/lib/shield";
import { commaWhole, shareLine, shareTokenNumber } from "@/lib/share-card";
import { holderTier } from "@/lib/tiers";
import { hasTraitShield, picturedFill, savingRules, sweetenedLine } from "@/lib/trait-rules";
import { DEMO_CHOGS } from "@/lib/pets";

const DAY = 20_000;

describe("token memory", () => {
  it("keys a real Chog by token id and a sample by its name", () => {
    expect(memoryKey("bubblegum", null)).toBe("sample:bubblegum");
    expect(memoryKey("held", 123)).toBe("token:123");
  });

  it("adds the set-aside and the mood onto that token", () => {
    const next = creditMemory(blankMemory("token:123", "Chog #123", 123), {
      streak: 14,
      added: 2_000n * CHOG_UNIT,
      mood: "legendary",
      title: "Beloved",
      day: DAY,
      at: 10,
    });
    expect(next.streak).toBe(14);
    expect(next.bestStreak).toBe(14);
    expect(next.jarTotal).toBe((2_000n * CHOG_UNIT).toString());
    expect(next.moodHistory[0]?.title).toBe("Beloved");
  });
});

describe("trait rules", () => {
  it("gives Laser a shield and Bubblegum a sweeter mood", () => {
    const laser = savingRules(DEMO_CHOGS[1].traits);
    const sweet = savingRules(DEMO_CHOGS[0].traits);
    expect(laser.map((rule) => rule.id)).toContain("shield");
    expect(hasTraitShield(DEMO_CHOGS[1].traits)).toBe(true);
    expect(sweet.map((rule) => rule.title)).toContain("Bonus mood");
    expect(sweetenedLine("The mood is still sweet.", DEMO_CHOGS[0].traits)).toMatch(/Bubblegum sweetens/);
    expect(sweetenedLine("Hangry.", DEMO_CHOGS[1].traits)).toBe("Hangry.");
  });

  it("fills the crown's jar picture faster without changing a plain Chog", () => {
    expect(picturedFill(14, DEMO_CHOGS[2].traits)).toBe(21);
    expect(picturedFill(14, DEMO_CHOGS[0].traits)).toBe(14);
    expect(savingRules(DEMO_CHOGS[3].traits).some((rule) => rule.id === "quiet")).toBe(true);
  });

  it("lets a shield cover one missed day and then continue the streak", () => {
    const fed = tryFeed(freshPocket(), DAY);
    if (!fed.ok) throw new Error("expected feed");
    expect(missedOneDay(fed.state.lastFeedDay, DAY + 2)).toBe(true);
    const covered = coverMiss(fed.state, DAY + 2, true, 0, false);
    expect(covered.cover).toBe("trait");
    const again = tryFeed(covered.state, DAY + 2);
    if (!again.ok) throw new Error("expected feed");
    expect(again.state.streak).toBe(2);
    const bare = coverMiss(fed.state, DAY + 2, false, 0, false);
    expect(bare.cover).toBe("none");
    const freeze = coverMiss(fed.state, DAY + 2, false, 1, true);
    expect(freeze.cover).toBe("freeze");
    expect(freeze.freezeLeft).toBe(0);
    expect(coverMiss(fed.state, DAY + 2, false, 1, false).cover).toBe("none");
  });
});

describe("share card, tiers, clock, and the board", () => {
  it("writes the public share line", () => {
    expect(shareTokenNumber("bubblegum", null)).toBe(11);
    expect(shareTokenNumber("held", 123)).toBe(123);
    expect(commaWhole(2_000n * CHOG_UNIT)).toBe("2,000");
    expect(shareLine(123, 14, 2_000n * CHOG_UNIT)).toBe("Chog #123 · 14-day streak · 2,000 $CHOG saved");
  });

  it("reads a holder tier from the balance alone", () => {
    expect(holderTier(0n).id).toBe("visitor");
    expect(holderTier(500n * CHOG_UNIT).skin).toBe("peach");
    expect(holderTier(500n * CHOG_UNIT).freeze).toBe(false);
    expect(holderTier(2_000n * CHOG_UNIT).freeze).toBe(true);
    expect(holderTier(2_500n * CHOG_UNIT).name).toBe("Keeper");
  });

  it("treats one minute as a day only when the judge clock is on", () => {
    expect(pocketDay(86_400, "day")).toBe(1);
    expect(pocketDay(120, "minute")).toBe(2);
    expect(skipAhead(1_000, "minute")).toBe(1_060);
    const now = 1_700_000_000;
    expect(shiftFeedDay(pocketDay(now, "day"), "day", "minute", now)).toBe(pocketDay(now, "minute"));
  });

  it("ranks streaks, jars, and Chogs about to break", () => {
    const board = buildBoard(DAY, []);
    expect(board.longest[0]?.tokenId).toBe(88);
    expect(board.biggest[0]?.tokenId).toBe(56);
    expect(board.atRisk.map((row) => row.tokenId)).toEqual([123, 14, 7]);
  });

});
