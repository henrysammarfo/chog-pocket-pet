import { expect, test, type Page } from "@playwright/test";

const PAGES = ["/", "/app", "/app/jar", "/app/streak", "/app/traits", "/app/history", "/app/pets", "/app/arcade", "/app/arcade/stack", "/app/arcade/tower", "/app/arcade/dash", "/app/arcade/floppy", "/app/arcade/coin2048", "/app/arcade/snack", "/app/leaderboard", "/app/settings", "/judges", "/connect", "/gallery", "/care", "/collection"];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("chog-e2e-cleared")) return;
    window.localStorage.clear();
    window.sessionStorage.setItem("chog-e2e-cleared", "1");
  });
  await page.route("https://chog.xyz/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>chog</body></html>" }),
  );
  await page.route("https://www.monad.xyz/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>monad</body></html>" }),
  );
});

async function visibleHrefs(page: Page) {
  return page.locator("a[href]").evaluateAll((els) => {
    const seen = new Set<string>();
    for (const el of els) {
      const href = el.getAttribute("href") ?? "";
      const style = window.getComputedStyle(el);
      const hidden = style.display === "none" || style.visibility === "hidden" || el.getClientRects().length === 0;
      if (!hidden) seen.add(href);
    }
    return [...seen];
  });
}

test.describe("every control", () => {
  for (const route of PAGES) {
    test(`clicks every visible link on ${route}`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.goto(route);
      const menu = page.getByTestId("menu-button");
      if ((await menu.count()) > 0) {
        await menu.click();
        await expect(page.getByTestId("mobile-menu")).toBeVisible();
      }
      const hrefs = await visibleHrefs(page);
      expect(hrefs.length).toBeGreaterThan(3);
      for (const href of hrefs) {
        expect(href).not.toBe("#");
        expect(href.startsWith("#")).toBe(false);
        expect(href.length).toBeGreaterThan(0);
        await page.goto(route);
        if ((await page.getByTestId("menu-button").count()) > 0) {
          await page.getByTestId("menu-button").click();
        }
        const link = page.locator(`a[href="${href}"]:visible`).first();
        await expect(link).toBeVisible();
        await link.click();
        const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        await expect(page).toHaveURL(new RegExp(href.startsWith("http") ? `^${escaped}` : `${escaped}$`));
      }
    });
  }

  test("landing buttons open the how-to and the questions", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "How it works" }).click();
    await expect(page.locator("#how")).toBeInViewport();
    const questions = page.locator("#faq button");
    const count = await questions.count();
    expect(count).toBeGreaterThan(2);
    for (let i = 0; i < count; i += 1) {
      const button = questions.nth(i);
      if ((await button.getAttribute("aria-expanded")) !== "true") await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("pocket buttons feed, switch, explain, and reset", async ({ page }) => {
    for (const name of ["Bubblegum Chog", "Laser Wizard", "Little Crown", "Quiet One"]) {
      await page.goto("/app/pets");
      await page.getByRole("button", { name }).click();
      await page.goto("/app");
      await expect(page.getByTestId("pet-name")).toHaveText(name);
    }
    await page.goto("/app/jar");
    for (const goal of ["50", "100", "250", "1000"]) {
      await page.getByTestId(`goal-${goal}`).click();
      await expect(page.getByTestId(`goal-${goal}`)).toHaveAttribute("aria-pressed", "true");
    }
    await page.getByTestId("goal-100").click();
    await page.getByTestId("feed-button").click();
    await page.goto("/app/history");
    await expect(page.getByTestId("history")).toContainText("100 $CHOG set aside");
    await page.goto("/app/streak");
    await page.getByTestId("tomorrow-button").click();
    await expect(page.getByTestId("demo-date")).toBeVisible();
    await page.goto("/app/settings");
    await page.getByTestId("how-button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await page.goto("/app/jar");
    await page.getByTestId("withdraw-button").click();
    await page.getByTestId("confirm-withdraw").click();
    await page.goto("/app/history");
    await expect(page.getByTestId("history")).toContainText("returned");
    await page.goto("/app/settings");
    await page.getByTestId("reset-button").click();
    await expect(page.getByTestId("saved-amount")).toContainText("0 $CHOG");
    await page.goto("/");
    await page.getByTestId("menu-button").click();
    await expect(page.getByTestId("mobile-menu")).toBeVisible();
    await page.getByTestId("menu-button").click();
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
  });

  test("gallery arrows and connect wallet button respond", async ({ page }) => {
    await page.goto("/gallery");
    await page.getByTestId("figurine-next").click();
    await expect(page.locator("[data-role='center'] img")).toHaveAttribute("alt", "Laser Wizard");
    await page.waitForTimeout(700);
    await page.getByTestId("figurine-prev").click();
    await expect(page.locator("[data-role='center'] img")).toHaveAttribute("alt", "Bubblegum Chog");

    await page.goto("/connect");
    await page.getByTestId("connect-wallet").click();
    await expect(page.getByTestId("connect-error")).toContainText("No wallet found");
    await page.getByTestId("back-to-demo").click();
    await expect(page.getByTestId("pet-name")).toHaveText("Bubblegum Chog");
  });

  test("the phone bar is one row and More lists the rest", async ({ page }) => {
    await page.goto("/app");
    const tabs = page.getByTestId("app-tabs");
    await expect(tabs.getByRole("link")).toHaveCount(4);
    await expect(tabs.getByRole("link", { name: "Arcade" })).toBeVisible();
    await expect(tabs.getByRole("button", { name: "More" })).toBeVisible();
    await tabs.getByRole("button", { name: "More" }).click();
    const sheet = page.getByTestId("more-sheet");
    await expect(sheet).toBeVisible();
    for (const name of ["Streak", "Traits", "History", "Pets", "Settings", "Gallery", "For judges", "Connect wallet"]) {
      await expect(sheet.getByRole("link", { name })).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
  });

  test("a game in play hides the bottom row", async ({ page }) => {
    await page.goto("/app/arcade/stack");
    await expect(page.getByTestId("app-tabs")).toBeVisible();
    await page.getByTestId("game-stack-start").click();
    await expect(page.getByTestId("game-stack")).toHaveAttribute("data-live", "1");
    await expect(page.getByTestId("app-tabs")).toHaveCount(0);
    await expect(page.getByTestId("play-chrome")).toContainText("Arcade");
    await expect(page.getByTestId("play-score")).toBeVisible();
  });
});
