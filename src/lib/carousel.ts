/** Role math from the Motion Sites "3D Collectible Hero" prompt. */

export const COUNT = 4;
export const DURATION_MS = 650;
export const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

export type Role = "center" | "left" | "right" | "back";
export type Direction = "next" | "prev";

export function roleFor(index: number, activeIndex: number): Role {
  if (index === activeIndex) return "center";
  if (index === (activeIndex + 3) % COUNT) return "left";
  if (index === (activeIndex + 1) % COUNT) return "right";
  return "back";
}

export function stepIndex(activeIndex: number, direction: Direction): number {
  if (direction === "next") return (activeIndex + 1) % COUNT;
  return (activeIndex + COUNT - 1) % COUNT;
}
