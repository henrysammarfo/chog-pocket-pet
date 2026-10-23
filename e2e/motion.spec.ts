import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("chog-e2e-cleared")) return;
    window.localStorage.clear();
    window.sessionStorage.setItem("chog-e2e-cleared", "1");
  });
});

test("the pocket shows a 3D stage and celebrates a set-aside", async ({ page }) => {
  await page.goto("/pocket");
  await expect(page.getByTestId("pet-scene")).toBeVisible();
  await expect(page.getByTestId("motion-nav")).toBeVisible();
  await page.getByTestId("feed-button").click();
  await expect(page.getByTestId("celebration")).toBeVisible();
  await expect(page.getByTestId("pet-scene")).toHaveAttribute("data-celebrate", "yes");
  await expect(page.getByTestId("mood")).toHaveAttribute("data-mood", "nibbling");
});

test("the collectible gallery spins the four Chogs", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page.getByTestId("ghost-word")).toHaveText("CHOG");
  await expect(page.locator("[data-role='center'] img")).toHaveAttribute("alt", "Bubblegum Chog");
  await page.getByTestId("figurine-next").click();
  await expect(page.locator("[data-role='center'] img")).toHaveAttribute("alt", "Laser Wizard");
  await page.waitForTimeout(700);
  await page.getByTestId("figurine-prev").click();
  await expect(page.locator("[data-role='center'] img")).toHaveAttribute("alt", "Bubblegum Chog");
  await page.getByTestId("open-pocket").click();
  await expect(page.getByTestId("pet-name")).toHaveText("Bubblegum Chog");
});

test("the care page uses the pet-shop headline", async ({ page }) => {
  await page.goto("/care");
  await expect(page.getByTestId("cozy-care")).toContainText("Everything");
  await expect(page.getByTestId("cozy-care")).toContainText("Your Chog Loves");
  await expect(page.getByRole("link", { name: "Open the pocket" }).first()).toBeVisible();
});

test("the collection page keeps the dark gallery", async ({ page }) => {
  await page.goto("/collection");
  await expect(page.getByTestId("orbis-hero")).toContainText("Your Chog");
  await expect(page.getByTestId("orbis-collection")).toContainText("MOOD SCORE:");
  await expect(page.getByText("FOLLOW THE STREAK.")).toBeVisible();
});
