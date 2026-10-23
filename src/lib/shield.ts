import type { PocketState } from "@/lib/savings";

/** A cover handles exactly one missed day. A longer gap still starts over. */
export function missedOneDay(lastFeedDay: number, today: number): boolean {
  return lastFeedDay !== 0 && today - lastFeedDay === 2;
}

export function shieldedLastFeed(lastFeedDay: number, today: number, covered: boolean): number {
  if (!covered || !missedOneDay(lastFeedDay, today)) return lastFeedDay;
  return today - 1;
}

export function coverMiss(
  state: PocketState,
  today: number,
  traitShield: boolean,
  freezeLeft: number,
  freezeAllowed: boolean,
): { state: PocketState; freezeLeft: number; cover: "none" | "trait" | "freeze" } {
  if (!missedOneDay(state.lastFeedDay, today)) {
    return { state, freezeLeft, cover: "none" };
  }
  const patched = { ...state, lastFeedDay: today - 1 };
  if (traitShield) return { state: patched, freezeLeft, cover: "trait" };
  if (freezeLeft > 0 && freezeAllowed) {
    return { state: patched, freezeLeft: freezeLeft - 1, cover: "freeze" };
  }
  return { state, freezeLeft, cover: "none" };
}
