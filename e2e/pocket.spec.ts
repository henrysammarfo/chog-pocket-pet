import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("chog-e2e-cleared")) return;
    window.localStorage.clear();
    window.sessionStorage.setItem("chog-e2e-cleared", "1");
  });
});

test("demo opens on a sample Chog with no wallet", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByTestId("pet-name")).toHaveText("Bubblegum Chog");
  await expect(page.getByTestId("demo-badge")).toBeVisible();
  await expect(page.getByTestId("mood")).toHaveAttribute("data-mood", "hungry");
  await expect(page.getByTestId("mood")).toHaveAttribute("data-voice", "sweet");
  await page.goto("/app/traits");
  await expect(page.getByTestId("personality")).toContainText("lean sweet");
  await page.goto("/app");
  await expect(page.getByTestId("streak-count")).toHaveText("0 day streak");
  await expect(page.getByTestId("saved-amount")).toContainText("0 $CHOG");
  await expect(page.getByRole("button", { name: "Connect wallet" })).toHaveCount(0);
});

test("a daily set-aside fills the jar and blocks a second feed", async ({ page }) => {
  await page.goto("/app");
  await page.getByTestId("feed-button").click();
  await expect(page.getByTestId("mood")).toHaveAttribute("data-mood", "nibbling");
  await expect(page.getByTestId("streak-count")).toHaveText("1 day streak");
  await expect(page.getByTestId("saved-amount")).toContainText("100 $CHOG");
  await expect(page.getByTestId("wallet-amount")).toContainText("2400 $CHOG");
  await expect(page.getByTestId("feed-button")).toHaveText("Fed today");
  await expect(page.getByTestId("feed-button")).toBeDisabled();
  await page.getByTestId("feed-button").click({ force: true });
  await expect(page.getByTestId("saved-amount")).toContainText("100 $CHOG");
});

test("skipping a morning keeps the streak, and a second skip breaks it", async ({ page }) => {
  await page.goto("/app");
  await page.getByTestId("feed-button").click();
  await page.goto("/app/streak");
  await page.getByTestId("tomorrow-button").click();
  await expect(page.getByTestId("demo-date")).toBeVisible();
  await page.goto("/app");
  await expect(page.getByTestId("mood")).toHaveAttribute("data-mood", "waiting");
  await expect(page.getByTestId("mood-title")).toHaveText("Waiting up");
  await expect(page.getByTestId("streak-count")).toHaveText("1 day streak");
  await page.getByTestId("feed-button").click();
  await expect(page.getByTestId("mood")).toHaveAttribute("data-mood", "cozy");
  await expect(page.getByTestId("streak-count")).toHaveText("2 day streak");
  await page.goto("/app/streak");
  await page.getByTestId("tomorrow-button").click();
  await page.getByTestId("tomorrow-button").click();
  await page.goto("/app");
  await expect(page.getByTestId("mood")).toHaveAttribute("data-mood", "sulking");
  await expect(page.getByTestId("streak-count")).toHaveText("0 day streak");
});

test("another sample Chog changes the personality and keeps the jar", async ({ page }) => {
  await page.goto("/app");
  await page.getByTestId("feed-button").click();
  await page.goto("/app/streak");
  await page.getByTestId("tomorrow-button").click();
  await page.goto("/app");
  await page.getByTestId("feed-button").click();
  await expect(page.getByTestId("mood-title")).toHaveText("Cozy");
  await page.goto("/app/pets");
  await page.getByRole("button", { name: "Laser Wizard" }).click();
  await page.goto("/app");
  await expect(page.getByTestId("pet-name")).toHaveText("Laser Wizard");
  await expect(page.getByTestId("mood")).toHaveAttribute("data-voice", "chaotic");
  await expect(page.getByTestId("mood-title")).toHaveText("Fizzing");
  await expect(page.getByTestId("pet-art")).toBeVisible();
  await expect(page.getByTestId("saved-amount")).toContainText("200 $CHOG");
  await page.goto("/app/traits");
  await expect(page.getByTestId("personality")).toContainText("lean wild");
  await expect(page.getByTestId("trait-list")).toContainText("fire laser");
});

test("taking coins back leaves the streak and says they are still yours", async ({ page }) => {
  await page.goto("/app");
  await page.getByTestId("feed-button").click();
  await page.goto("/app/jar");
  await page.getByTestId("withdraw-button").click();
  await page.getByTestId("confirm-withdraw").click();
  await expect(page.locator("[data-testid='saved-amount']:visible")).toContainText("0 $CHOG");
  await expect(page.locator("[data-testid='wallet-amount']:visible")).toContainText("2500 $CHOG");
  await page.goto("/app");
  await expect(page.getByTestId("mood-line")).toContainText("still yours");
  await expect(page.getByTestId("streak-count")).toHaveText("1 day streak");
});

test("a thin pocket cannot feed", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "chog-pocket-demo-v1",
      JSON.stringify({
        petId: "quiet",
        wallet: "40000000000000000000",
        saved: "0",
        lastFeedDay: 0,
        streak: 0,
        goal: "100000000000000000000",
        withdrewOnDay: 0,
        clock: null,
      }),
    );
  });
  await page.goto("/app");
  await expect(page.getByTestId("pet-name")).toHaveText("Quiet One");
  await expect(page.getByTestId("mood")).toHaveAttribute("data-voice", "soft");
  await expect(page.getByTestId("feed-button")).toHaveText("Not enough $CHOG");
  await expect(page.getByTestId("feed-hint")).toContainText("only has 40 $CHOG");
});

test("the daily amount can change, and start over clears the jar", async ({ page }) => {
  await page.goto("/app/jar");
  await page.getByTestId("goal-250").click();
  await expect(page.getByTestId("feed-button")).toHaveText("Set aside 250 $CHOG");
  await page.getByTestId("feed-button").click();
  await expect(page.getByTestId("saved-amount")).toContainText("250 $CHOG");
  await page.goto("/app/settings");
  await page.getByTestId("reset-button").click();
  await expect(page.getByTestId("pet-name")).toHaveText("Bubblegum Chog");
  await expect(page.getByTestId("saved-amount")).toContainText("0 $CHOG");
  await expect(page.getByTestId("mood")).toHaveAttribute("data-mood", "hungry");
});

test("how this works explains the pet in plain language", async ({ page }) => {
  await page.goto("/app/settings");
  await page.getByTestId("how-button").click();
  await expect(page.getByRole("dialog")).toContainText("The pet is the Chog");
  await expect(page.getByRole("dialog")).toContainText("setting $CHOG aside");
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("wallet mode explains itself when no wallet is installed", async ({ page }) => {
  await page.goto("/app");
  await page.getByTestId("use-wallet").click();
  await expect(page.getByTestId("connect-wallet")).toBeVisible();
  await page.getByTestId("connect-wallet").click();
  await expect(page.getByTestId("connect-error")).toContainText("No wallet found");
  await page.getByTestId("back-to-demo").click();
  await expect(page.getByTestId("pet-name")).toHaveText("Bubblegum Chog");
});

test("desktop width does not spill sideways", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/app");
  await expect(page.getByTestId("pet-name")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByTestId("feed-button").click();
  await expect(page.getByTestId("streak-count")).toHaveText("1 day streak");
});
