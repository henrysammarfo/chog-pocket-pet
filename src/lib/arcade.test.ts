import { describe, expect, it } from "vitest";
import { applyArcadeScore, arcadeAccess, moodFromArcade, scoredPoints } from "@/lib/arcade";
import { openingGrid, slideGrid } from "@/lib/coin2048";
import { blankMemory } from "@/lib/memory";
import { buildBoard } from "@/lib/leaderboard";
import {
  DASH,
  FLOPPY,
  createFloppy,
  dashJumpClears,
  dashObstacle,
  flapBird,
  stackLand,
  stackOffset,
  stackWouldMiss,
  stepFloppy,
  towerOverlap,
} from "@/lib/play-physics";

describe("arcade rewards", () => {
  it("lets a Chog play and doubles the score when Genesis is held", () => {
    expect(arcadeAccess(false, false)).toEqual({ play: false, boost: false });
    expect(arcadeAccess(true, false)).toEqual({ play: true, boost: false });
    expect(arcadeAccess(true, true)).toEqual({ play: true, boost: true });
    expect(scoredPoints(7, false)).toBe(7);
    expect(scoredPoints(7, true)).toBe(14);
    expect(scoredPoints(0, true)).toBe(0);
  });

  it("feeds mood and one streak morning, once per day", () => {
    const start = blankMemory("sample:bubblegum", "Bubblegum Chog", null);
    const first = applyArcadeScore(start, { gameId: "stack", raw: 3, boost: false, day: 10, at: 1 });
    expect(first.streak).toBe(1);
    expect(first.playStreak).toBe(1);
    expect(first.moodHistory[0]?.title).toBe("Arcade cozy");
    expect(first.arcadeBest?.stack).toBe(3);
    const again = applyArcadeScore(first, { gameId: "dash", raw: 8, boost: true, day: 10, at: 2 });
    expect(again.streak).toBe(1);
    expect(again.arcadeBest?.dash).toBe(16);
    expect(again.arcadeTotal).toBe(19);
    expect(moodFromArcade(40).title).toBe("Arcade legend");
    const nextDay = applyArcadeScore(again, { gameId: "snack", raw: 1, boost: false, day: 11, at: 3 });
    expect(nextDay.streak).toBe(2);
  });
});

describe("chog 2048", () => {
  it("merges the opening coins to the right", () => {
    const slid = slideGrid(openingGrid(), "right");
    expect(slid.moved).toBe(true);
    expect(slid.score).toBe(4);
    expect(slid.grid[0]).toEqual([0, 0, 0, 4]);
  });
});

describe("chog dash clearance", () => {
  it("clears every obstacle with a well-timed jump, including at top speed", () => {
    for (const kind of ["rug", "candle"] as const) {
      for (const speed of [DASH.startSpeed, 340, DASH.maxSpeed]) {
        const leads = Array.from({ length: 28 }, (_, i) => i * 12);
        const cleared = leads.filter((lead) => dashJumpClears(kind, speed, lead));
        expect(cleared.length).toBeGreaterThan(0);
      }
    }
    const candle = dashObstacle("candle");
    const rug = dashObstacle("rug");
    expect(candle.h).toBeLessThan(rug.h + 80);
    expect(DASH.gap).toBeGreaterThan(DASH.maxSpeed * (2 * Math.abs(DASH.jumpVy) / DASH.gravity));
  });
});

describe("chog stack landings", () => {
  it("keeps a partial land and only misses when the block misses the tower", () => {
    const top = { x: 400, w: 168 };
    const partial = stackLand(top, 400 + 70, 168);
    expect(partial.ok).toBe(true);
    if (partial.ok) expect(partial.w).toBeGreaterThan(50);
    const narrow = stackLand({ x: 400, w: 80 }, 430, 80);
    expect(narrow.ok).toBe(true);
    expect(stackLand(top, 400 + 200, 168).ok).toBe(false);
    const width = 168;
    let sawMiss = false;
    for (let ms = 0; ms < 3800; ms += 16) {
      if (stackWouldMiss(stackOffset(ms, width), width)) sawMiss = true;
    }
    expect(sawMiss).toBe(true);
    expect(stackWouldMiss(stackOffset(0, width), width)).toBe(false);
  });
});

describe("floppy chog gaps", () => {
  it("falls if you never flap, and a timed flap clears several pipes", () => {
    const idle = createFloppy();
    for (let t = 0; t < 4000 && !idle.bird.dead; t += 16) stepFloppy(idle, 16);
    expect(idle.bird.dead).toBe(true);
    expect(idle.bird.points).toBe(0);

    const state = createFloppy();
    for (let t = 0; t < 14000 && !state.bird.dead; t += 16) {
      const pipe = state.pipes.find((item) => item.x + FLOPPY.pipeW > FLOPPY.birdX) ?? state.pipes[0];
      const target = pipe.gapY + (FLOPPY.gapH - FLOPPY.birdH) / 2;
      if (state.bird.y > target + 4 && state.bird.vy > -30) flapBird(state.bird);
      stepFloppy(state, 16);
    }
    expect(state.bird.points).toBeGreaterThanOrEqual(3);
  });
});

describe("chog tower overlap", () => {
  it("counts any positive overlap and misses only past the edge", () => {
    expect(towerOverlap(0.4, 2.4)).toBeGreaterThan(1);
    expect(towerOverlap(2.4, 2.4)).toBe(0);
    expect(towerOverlap(2.7, 2.4)).toBeLessThan(0);
  });
});

describe("arcade leaderboard", () => {
  it("ranks the seeded arcade scores", () => {
    const board = buildBoard(20, []);
    expect(board.arcade[0]?.tokenId).toBe(88);
    expect(board.arcade[0]?.arcade).toBe(90);
  });
});
