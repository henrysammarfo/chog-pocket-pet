import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("chog-e2e-cleared")) return;
    window.localStorage.clear();
    window.sessionStorage.setItem("chog-e2e-cleared", "1");
  });
});

const GAMES = [
  { id: "stack", key: "Space" },
  { id: "tower", key: "Space" },
  { id: "dash", key: "Space" },
  { id: "floppy", key: "Space" },
  { id: "coin2048", key: "ArrowRight" },
  { id: "snack", key: "Enter" },
] as const;

test("the arcade lists six credited games", async ({ page }) => {
  await page.goto("/app/arcade");
  const list = page.getByTestId("arcade-list");
  await expect(list).toContainText("Chog Stack");
  await expect(list).toContainText("Chog Tower 3D");
  await expect(list).toContainText("Chog Dash");
  await expect(list).toContainText("Floppy Chog");
  await expect(list).toContainText("Chog 2048");
  await expect(list).toContainText("Chog Snack Hunt");
  await expect(list).toContainText("MIT");
  await expect(list).toContainText("Apache-2.0");
  await expect(list).toContainText("BSD-3-Clause");
});

for (const game of GAMES) {
  test(`${game.id} answers the keyboard and can bank a score`, async ({ page }) => {
    await page.goto(`/app/arcade/${game.id}`);
    await expect(page.getByTestId("arcade-access")).toContainText("Chog");
    await page.getByTestId(`game-${game.id}-start`).click();
    await expect(page.getByTestId(`game-${game.id}`)).toHaveAttribute("data-live", "1");
    await page.keyboard.press(game.key);
    await expect(page.getByTestId(`game-${game.id}`)).toHaveAttribute("data-acted", "1");
    if (game.id === "floppy") return;
    await expect(page.getByTestId(`game-${game.id}-score`)).not.toHaveText("0");
    await expect(page.getByTestId("arcade-banked")).toContainText("Arcade");
  });

  test(`${game.id} shows the game-over card`, async ({ page }) => {
    test.setTimeout(20_000);
    if (game.id === "coin2048") {
      await page.addInitScript(() => window.sessionStorage.setItem("chog-e2e-2048-lock", "1"));
    }
    await page.goto(`/app/arcade/${game.id}`);
    await page.getByTestId(`game-${game.id}-start`).click();
    await expect(page.getByTestId(`game-${game.id}`)).toHaveAttribute("data-live", "1");
    if (game.id === "stack" || game.id === "tower") {
      await page.waitForFunction(
        (id) => document.querySelector(`[data-testid="game-${id}"]`)?.getAttribute("data-swing") === "wide",
        game.id,
      );
      await page.keyboard.press("Space");
    } else if (game.id === "coin2048") {
      await page.keyboard.press("ArrowLeft");
    } else if (game.id === "snack") {
      for (let i = 0; i < 12; i += 1) await page.keyboard.press("ArrowUp");
      await page.keyboard.press("Enter");
      await page.keyboard.press("Enter");
      await page.keyboard.press("Enter");
    }
    const card = page.getByTestId(`game-${game.id}-over`);
    await expect(card).toBeVisible();
    await expect(card).toContainText("points landed on your Chog");
    await expect(page.getByTestId(`game-${game.id}-again`)).toBeVisible();
    await expect(page.getByRole("button", { name: "Share on X" })).toBeVisible();
  });
}

test("a stacked score shows on the pet and the leaderboard", async ({ page }) => {
  await page.goto("/app/arcade/stack");
  await page.getByTestId("game-stack-start").click();
  await expect(page.getByTestId("game-stack")).toHaveAttribute("data-live", "1");
  await page.keyboard.press("Space");
  await expect(page.getByTestId("arcade-banked")).toContainText("Streak on this Chog: 1");
  await page.goto("/app/pets");
  await expect(page.getByTestId("memory-moods")).toContainText("Arcade cozy");
  await expect(page.getByTestId("memory-streak")).toContainText("1 day streak");
  await page.goto("/app/leaderboard");
  await expect(page.getByTestId("board-arcade")).toContainText("Chog #88");
  await expect(page.getByTestId("board-arcade")).toContainText("Bubblegum Chog");
});
