import { describe, expect, it } from "vitest";
import { COUNT, DURATION_MS, roleFor, stepIndex } from "./carousel";

describe("collectible carousel", () => {
  it("keeps the prompt timing and a set of four", () => {
    expect(COUNT).toBe(4);
    expect(DURATION_MS).toBe(650);
  });

  it("places center, left, right, and back around the active figurine", () => {
    expect(roleFor(0, 0)).toBe("center");
    expect(roleFor(3, 0)).toBe("left");
    expect(roleFor(1, 0)).toBe("right");
    expect(roleFor(2, 0)).toBe("back");
    expect(roleFor(0, 1)).toBe("left");
    expect(roleFor(2, 1)).toBe("right");
    expect(roleFor(3, 1)).toBe("back");
  });

  it("steps forward and back inside the set", () => {
    expect(stepIndex(0, "next")).toBe(1);
    expect(stepIndex(3, "next")).toBe(0);
    expect(stepIndex(0, "prev")).toBe(3);
    expect(stepIndex(2, "prev")).toBe(1);
  });
});
