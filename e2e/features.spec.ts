import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("chog-e2e-cleared")) return;
    window.localStorage.clear();
    window.sessionStorage.setItem("chog-e2e-cleared", "1");
  });
});

test("the pet page shows token memory and why the Chog matters", async ({ page }) => {
  await page.goto("/app");
  await page.getByTestId("feed-button").click();
  await page.goto("/app/pets");
  await expect(page.getByTestId("why-chog")).toContainText("Without a Chog, there is no pet");
  await expect(page.getByTestId("memory-streak")).toContainText("1 day streak");
  await expect(page.getByTestId("memory-jar")).toContainText("100 $CHOG");
  await expect(page.getByTestId("memory-moods")).toContainText("Nibbling");
  await expect(page.getByTestId("inherit-streak")).toHaveText("14 day streak");
  await expect(page.getByTestId("inherit-jar")).toContainText("2,000 $CHOG");
  await expect(page.getByTestId("share-inherit")).toHaveAttribute(
    "data-line",
    "Chog #123 · 14-day streak · 2,000 $CHOG saved",
  );
});

test("traits change the saving rules", async ({ page }) => {
  await page.goto("/app/traits");
  await expect(page.getByTestId("trait-rules")).toContainText("Bonus mood");
  await page.goto("/app/pets");
  await page.getByRole("button", { name: "Laser Wizard" }).click();
  await page.goto("/app/traits");
  await expect(page.getByTestId("trait-rules")).toContainText("Streak shield");
});

test("the leaderboard, the clock, and the judge steps are reachable", async ({ page }) => {
  await page.goto("/app/leaderboard");
  await expect(page.getByTestId("board-streak")).toContainText("Chog #88");
  await expect(page.getByTestId("board-jar")).toContainText("Chog #56");
  await expect(page.getByTestId("board-risk")).toContainText("Chog #123");
  await page.goto("/app/settings");
  await expect(page.getByTestId("holder-tier")).toContainText("Keeper");
  await page.getByTestId("speed-toggle").click();
  await expect(page.getByRole("heading", { name: "1 day = 1 minute" })).toBeVisible();
  await page.goto("/judges");
  await expect(page.getByTestId("judge-steps")).toContainText("Set something aside");
  await expect(page.getByTestId("judge-steps")).toContainText("See why the Chog matters");
  await expect(page.getByTestId("judge-steps")).toContainText("Speed up a day");
});
