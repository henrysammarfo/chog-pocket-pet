import { CHOG_UNIT } from "@/lib/format";
import { nextStreak, streakStatus } from "@/lib/streak";

export const MIN_FEED = 50n * CHOG_UNIT;
export const DEMO_WALLET = 2_500n * CHOG_UNIT;
export const DEFAULT_GOAL = 100n * CHOG_UNIT;
export const GOAL_PRESETS = [50n, 100n, 250n, 1_000n].map(
  (whole) => whole * CHOG_UNIT,
);

export type PocketState = {
  wallet: bigint;
  saved: bigint;
  lastFeedDay: number;
  streak: number;
  goal: bigint;
  withdrewOnDay: number;
};

export function freshPocket(): PocketState {
  return {
    wallet: DEMO_WALLET,
    saved: 0n,
    lastFeedDay: 0,
    streak: 0,
    goal: DEFAULT_GOAL,
    withdrewOnDay: 0,
  };
}

export type FeedReason = "already" | "small" | "broke";
export type WithdrawReason = "empty" | "too-much";

export type FeedOutcome =
  | { ok: true; state: PocketState }
  | { ok: false; reason: FeedReason; state: PocketState };

export type WithdrawOutcome =
  | { ok: true; state: PocketState }
  | { ok: false; reason: WithdrawReason; state: PocketState };

/**
 * One counted set-aside. Same-day calls are refused here so the pet has a
 * clear "come back tomorrow". The contract still accepts a same-day top-up;
 * `nextStreak` covers that case and leaves the streak unchanged.
 */
export function tryFeed(state: PocketState, today: number): FeedOutcome {
  if (state.goal < MIN_FEED) return { ok: false, reason: "small", state };
  if (streakStatus(state.lastFeedDay, today) === "fed") {
    return { ok: false, reason: "already", state };
  }
  if (state.wallet < state.goal) return { ok: false, reason: "broke", state };
  return { ok: true, state: applyFeed(state, today, state.goal) };
}

/** Balance move plus the streak rule. Caller must already know the amount fits. */
export function applyFeed(
  state: PocketState,
  today: number,
  amount: bigint,
): PocketState {
  return {
    ...state,
    wallet: state.wallet - amount,
    saved: state.saved + amount,
    streak: nextStreak(state.lastFeedDay, state.streak, today),
    lastFeedDay: today,
  };
}

export function tryWithdraw(
  state: PocketState,
  today: number,
  amount: bigint,
): WithdrawOutcome {
  if (state.saved === 0n || amount <= 0n) {
    return { ok: false, reason: "empty", state };
  }
  if (amount > state.saved) return { ok: false, reason: "too-much", state };
  return {
    ok: true,
    state: {
      ...state,
      wallet: state.wallet + amount,
      saved: state.saved - amount,
      withdrewOnDay: today,
    },
  };
}

export function withGoal(state: PocketState, goal: bigint): PocketState {
  if (goal < MIN_FEED) return state;
  return { ...state, goal };
}

/** How full the jar looks after a week of the current daily amount. */
export function jarFill(saved: bigint, goal: bigint): number {
  if (goal <= 0n || saved <= 0n) return 0;
  const week = goal * 7n;
  const pct = Number((saved * 100n) / week);
  if (pct > 100) return 100;
  return pct;
}
