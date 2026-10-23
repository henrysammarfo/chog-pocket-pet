import { describe, expect, it } from "vitest";
import { asChainPocket } from "@/lib/chain-pocket";
import { saveToState, stateToSave } from "@/lib/demo-store";
import { CHOG_UNIT, formatChog, streakLabel } from "@/lib/format";
import { traitsFromMetadata, ipfsToHttp, ipfsCandidates } from "@/lib/metadata";
import { moodFor } from "@/lib/mood";
import { DEMO_CHOGS } from "@/lib/pets";
import { profileOf, voiceOf } from "@/lib/personality";
import { buildView } from "@/lib/present";
import { chunkTokenIds, keepOwned } from "@/lib/scan-plan";
import {
  applyFeed,
  freshPocket,
  jarFill,
  MIN_FEED,
  tryFeed,
  tryWithdraw,
  withGoal,
} from "@/lib/savings";
import {
  nextStreak,
  skipToNextMorning,
  streakStatus,
  utcDay,
  visibleStreak,
} from "@/lib/streak";
import { plainTxError } from "@/lib/tx-error";

const DAY = 20_000;

describe("streak rules, matching the jar contract", () => {
  it("cuts days on UTC midnight", () => {
    expect(utcDay(0)).toBe(0);
    expect(utcDay(86_399)).toBe(0);
    expect(utcDay(86_400)).toBe(1);
  });

  it("starts at 1, holds on the same day, and grows on the next day", () => {
    expect(nextStreak(0, 0, DAY)).toBe(1);
    expect(nextStreak(DAY, 1, DAY)).toBe(1);
    expect(nextStreak(DAY, 1, DAY + 1)).toBe(2);
    expect(nextStreak(DAY, 4, DAY + 1)).toBe(5);
  });

  it("does not treat never-fed as the day before day 1", () => {
    expect(nextStreak(0, 0, 1)).toBe(1);
  });

  it("resets after a gap", () => {
    expect(nextStreak(DAY, 6, DAY + 2)).toBe(1);
  });

  it("hides a broken streak until the next set-aside", () => {
    expect(visibleStreak(0, 0, DAY)).toBe(0);
    expect(visibleStreak(DAY, 3, DAY)).toBe(3);
    expect(visibleStreak(DAY, 3, DAY + 1)).toBe(3);
    expect(visibleStreak(DAY, 3, DAY + 2)).toBe(0);
    expect(streakStatus(DAY, DAY + 1)).toBe("alive");
    expect(streakStatus(DAY, DAY)).toBe("fed");
    expect(streakStatus(0, DAY)).toBe("never");
    expect(streakStatus(DAY, DAY + 3)).toBe("broken");
  });

  it("skips to 01:00 UTC the next morning", () => {
    const now = DAY * 86_400 + 50_000;
    const next = skipToNextMorning(now);
    expect(utcDay(next)).toBe(utcDay(now) + 1);
    expect(next % 86_400).toBe(3_600);
  });
});

describe("savings", () => {
  it("moves the daily amount into the jar and counts day one", () => {
    const fed = tryFeed(freshPocket(), DAY);
    expect(fed.ok).toBe(true);
    if (!fed.ok) return;
    expect(fed.state.streak).toBe(1);
    expect(fed.state.saved).toBe(100n * CHOG_UNIT);
    expect(fed.state.wallet).toBe(2_400n * CHOG_UNIT);
    expect(fed.state.lastFeedDay).toBe(DAY);
  });

  it("refuses a second set-aside on the same day", () => {
    const first = tryFeed(freshPocket(), DAY);
    if (!first.ok) throw new Error("expected feed");
    const second = tryFeed(first.state, DAY);
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.reason).toBe("already");
    expect(second.state.saved).toBe(first.state.saved);
  });

  it("lets a same-day top-up add coins without growing the streak", () => {
    const once = applyFeed(freshPocket(), DAY, 100n * CHOG_UNIT);
    const twice = applyFeed(once, DAY, 50n * CHOG_UNIT);
    expect(twice.streak).toBe(1);
    expect(twice.saved).toBe(150n * CHOG_UNIT);
    expect(twice.lastFeedDay).toBe(DAY);
  });

  it("grows the streak on the next day and restarts after a miss", () => {
    const first = tryFeed(freshPocket(), DAY);
    if (!first.ok) throw new Error("expected feed");
    const second = tryFeed(first.state, DAY + 1);
    if (!second.ok) throw new Error("expected feed");
    expect(second.state.streak).toBe(2);
    const later = tryFeed(second.state, DAY + 4);
    if (!later.ok) throw new Error("expected feed");
    expect(later.state.streak).toBe(1);
  });

  it("refuses a set-aside the pocket cannot cover", () => {
    const poor = withGoal({ ...freshPocket(), wallet: 40n * CHOG_UNIT }, 100n * CHOG_UNIT);
    const result = tryFeed(poor, DAY);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("broke");
  });

  it("refuses a goal under 50", () => {
    const tiny = { ...freshPocket(), goal: MIN_FEED - 1n };
    const result = tryFeed(tiny, DAY);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("small");
    expect(withGoal(freshPocket(), 10n * CHOG_UNIT).goal).toBe(100n * CHOG_UNIT);
  });

  it("returns coins without touching the streak", () => {
    const fed = tryFeed(freshPocket(), DAY);
    if (!fed.ok) throw new Error("expected feed");
    const back = tryWithdraw(fed.state, DAY, 40n * CHOG_UNIT);
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    expect(back.state.saved).toBe(60n * CHOG_UNIT);
    expect(back.state.streak).toBe(1);
    expect(back.state.lastFeedDay).toBe(DAY);
    expect(back.state.withdrewOnDay).toBe(DAY);
    expect(tryWithdraw(back.state, DAY, 1000n * CHOG_UNIT).ok).toBe(false);
    expect(tryWithdraw({ ...back.state, saved: 0n }, DAY, 1n).ok).toBe(false);
  });

  it("fills the jar across a week of the daily amount", () => {
    expect(jarFill(0n, 100n * CHOG_UNIT)).toBe(0);
    expect(jarFill(100n * CHOG_UNIT, 100n * CHOG_UNIT)).toBe(14);
    expect(jarFill(700n * CHOG_UNIT, 100n * CHOG_UNIT)).toBe(100);
    expect(jarFill(900n * CHOG_UNIT, 100n * CHOG_UNIT)).toBe(100);
  });
});

describe("personality and mood", () => {
  it("gives the sample Chogs different voices from their traits", () => {
    const voices = Object.fromEntries(
      DEMO_CHOGS.map((pet) => [pet.id, profileOf(pet.traits).voice]),
    );
    expect(voices).toEqual({
      bubblegum: "sweet",
      laser: "chaotic",
      crown: "showy",
      quiet: "soft",
    });
  });

  it("stays steady when a Chog publishes no traits", () => {
    expect(voiceOf(profileOf({}).scores)).toBe("steady");
    expect(profileOf({}).summary).toMatch(/no traits/i);
  });

  it("picks the mood from the streak, then the title from the traits", () => {
    expect(moodFor("never", 0)).toBe("hungry");
    expect(moodFor("broken", 0)).toBe("sulking");
    expect(moodFor("alive", 4)).toBe("waiting");
    expect(moodFor("fed", 1)).toBe("nibbling");
    expect(moodFor("fed", 3)).toBe("cozy");
    expect(moodFor("fed", 6)).toBe("buzzing");
    expect(moodFor("fed", 7)).toBe("glowing");
    expect(moodFor("fed", 14)).toBe("legendary");

    const pocket = freshPocket();
    const sweet = buildView(DEMO_CHOGS[0], pocket, DAY, true);
    const wild = buildView(DEMO_CHOGS[1], pocket, DAY, true);
    expect(sweet.moodId).toBe("hungry");
    expect(sweet.moodTitle).toBe("Peckish");
    expect(sweet.moodLine).toMatch(/still sweet/);
    expect(wild.moodTitle).toBe("Hangry");
    expect(wild.moodLine).toMatch(/empty jar/);
    expect(sweet.moodLine).not.toBe(wild.moodLine);
  });

  it("keeps the jar and changes the voice when the Chog changes", () => {
    const fed = tryFeed(freshPocket(), DAY);
    if (!fed.ok) throw new Error("expected feed");
    const next = tryFeed(fed.state, DAY + 1);
    if (!next.ok) throw new Error("expected feed");
    const sweet = buildView(DEMO_CHOGS[0], next.state, DAY + 1, true);
    const wild = buildView(DEMO_CHOGS[1], next.state, DAY + 1, true);
    expect(sweet.streak).toBe(2);
    expect(wild.streak).toBe(2);
    expect(sweet.moodId).toBe("cozy");
    expect(wild.moodId).toBe("cozy");
    expect(sweet.moodTitle).toBe("Cozy");
    expect(wild.moodTitle).toBe("Fizzing");
    expect(sweet.savedLabel).toBe(wild.savedLabel);
  });

  it("says the jar is closed when savings are not on Monad", () => {
    const view = buildView(DEMO_CHOGS[2], freshPocket(), DAY, false);
    expect(view.moodId).toBe("unjarred");
    expect(view.feedDisabled).toBe(true);
    expect(view.moodTitle).toBe("Ready to be admired");
    expect(view.savedLabel).toMatch(/not on Monad/);
  });

  it("mentions a withdrawal without breaking the day", () => {
    const fed = tryFeed(freshPocket(), DAY);
    if (!fed.ok) throw new Error("expected feed");
    const back = tryWithdraw(fed.state, DAY, fed.state.saved);
    if (!back.ok) throw new Error("expected withdraw");
    const view = buildView(DEMO_CHOGS[0], back.state, DAY, true);
    expect(view.moodId).toBe("nibbling");
    expect(view.moodLine).toMatch(/still yours/);
    expect(view.feedLabel).toBe("Fed today");
  });
});

describe("small helpers", () => {
  it("formats whole coins and a short fraction", () => {
    expect(formatChog(100n * CHOG_UNIT)).toBe("100");
    expect(formatChog((3n * CHOG_UNIT) / 2n)).toBe("1.5");
    expect(formatChog(0n)).toBe("0");
    expect(streakLabel(1)).toBe("1 day streak");
    expect(streakLabel(2)).toBe("2 day streak");
  });

  it("reads trait lists and ipfs links", () => {
    expect(
      traitsFromMetadata({
        attributes: [
          { trait_type: "Eyes", value: "Heart" },
          { trait_type: "Tier", value: 2 },
          { trait_type: "", value: "skip" },
        ],
      }),
    ).toEqual({ Eyes: "Heart", Tier: "2" });
    expect(ipfsToHttp("ipfs://abc/1.json", "https://gateway.pinata.cloud/ipfs/")).toBe(
      "https://gateway.pinata.cloud/ipfs/abc/1.json",
    );
    expect(ipfsCandidates("ipfs://bafybeid4ybujnscdipkno7ps5utqelp5ry5ryreqhay3zhgk3a6x4jruqu/4.json")[0]).toBe(
      "https://bafybeid4ybujnscdipkno7ps5utqelp5ry5ryreqhay3zhgk3a6x4jruqu.ipfs.dweb.link/4.json",
    );
  });

  it("round-trips a demo save and drops a broken one", () => {
    const state = freshPocket();
    const save = stateToSave("laser", state, 123);
    expect(saveToState(save)?.petId).toBe("laser");
    expect(saveToState({ ...save, wallet: "nope" })).toBeNull();
    expect(saveToState({ ...save, petId: "missing" })?.petId).toBe("bubblegum");
  });

  it("chunks a collection and keeps only the connected owner", () => {
    expect(chunkTokenIds(5, 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunkTokenIds(0, 10)).toEqual([]);
    expect(
      keepOwned([1, 2, 3], ["0xAa", "0xBb", "0xAa"], "0xaa"),
    ).toEqual([1, 3]);
  });

  it("reads a jar record from either shape", () => {
    expect(
      asChainPocket({
        saved: 5n,
        lastFeedDay: 9n,
        streak: 2n,
        withdrewOnDay: 0n,
      }),
    ).toEqual({ saved: 5n, lastFeedDay: 9, streak: 2, withdrewOnDay: 0 });
    expect(asChainPocket([8n, 3n, 1n, 3n])).toEqual({
      saved: 8n,
      lastFeedDay: 3,
      streak: 1,
      withdrewOnDay: 3,
    });
    expect(asChainPocket(null)).toBeNull();
  });

  it("turns wallet errors into plain sentences", () => {
    expect(plainTxError(new Error("user rejected the request"))).toMatch(/Nothing moved/);
    expect(plainTxError(new Error("insufficient funds for gas"))).toMatch(/not enough/i);
    expect(plainTxError(new Error("execution reverted 0x1234"))).toMatch(/Nothing was set aside/);
  });
});
