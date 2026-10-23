export type DemoSpeed = "day" | "minute";

const DAY = 86_400;
const MINUTE = 60;

export function pocketDay(unixSeconds: number, speed: DemoSpeed): number {
  const span = speed === "minute" ? MINUTE : DAY;
  return Math.floor(unixSeconds / span);
}

/** Keep "fed today" and "fed yesterday" when the clock changes speed. */
export function shiftFeedDay(lastFeedDay: number, from: DemoSpeed, to: DemoSpeed, nowSec: number): number {
  if (from === to || lastFeedDay === 0) return lastFeedDay;
  const delta = pocketDay(nowSec, from) - lastFeedDay;
  return pocketDay(nowSec, to) - delta;
}

export function skipAhead(unixSeconds: number, speed: DemoSpeed): number {
  if (speed === "minute") return unixSeconds + MINUTE;
  return (Math.floor(unixSeconds / DAY) + 1) * DAY + 3_600;
}
