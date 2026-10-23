/**
 * Day math for the savings streak.
 * Keep this in step with contracts/ChogPocketJar.sol.
 * A day is a UTC day (86,400 unix seconds), the same cut Solidity uses for `1 days`.
 */

export const DAY_SECONDS = 86_400;

export function utcDay(unixSeconds: number): number {
  return Math.floor(unixSeconds / DAY_SECONDS);
}

export function currentUtcDay(): number {
  return utcDay(Math.floor(Date.now() / 1000));
}

/**
 * Streak stored after a feed that counts.
 * Same day: unchanged. Next day: plus one. Any gap, or the first feed: 1.
 * lastFeedDay 0 means "never", and must not count as the day before day 1.
 */
export function nextStreak(
  lastFeedDay: number,
  streak: number,
  today: number,
): number {
  if (lastFeedDay === today) return streak;
  if (lastFeedDay !== 0 && lastFeedDay + 1 === today) return streak + 1;
  return 1;
}

export type StreakStatus = "never" | "fed" | "alive" | "broken";

export function streakStatus(
  lastFeedDay: number,
  today: number,
): StreakStatus {
  if (lastFeedDay === 0) return "never";
  if (lastFeedDay === today) return "fed";
  if (lastFeedDay + 1 === today) return "alive";
  return "broken";
}

/** Streak the pet should show. A missed day hides the old number until the next feed. */
export function visibleStreak(
  lastFeedDay: number,
  streak: number,
  today: number,
): number {
  const status = streakStatus(lastFeedDay, today);
  if (status === "fed" || status === "alive") return streak;
  return 0;
}

/** 01:00 UTC on the next day, so a demo skip always crosses the day cut. */
export function skipToNextMorning(unixSeconds: number): number {
  return (utcDay(unixSeconds) + 1) * DAY_SECONDS + 3_600;
}

export function demoDateLabel(unixSeconds: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(unixSeconds * 1000));
}
