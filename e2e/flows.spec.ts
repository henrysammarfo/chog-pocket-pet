import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("chog-e2e-cleared")) return;
    window.localStorage.clear();
    window.sessionStorage.setItem("chog-e2e-cleared", "1");
  });
});

test("a first visit can set money aside with no wallet", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Open pocket" }).first()).toBeVisible();
  await page.goto("/app");
  await expect(page.getByTestId("demo-badge")).toBeVisible();
  await expect(page.getByTestId("feed-button")).toHaveText("Set aside 100 $CHOG");
  await page.goto("/app/history");
  await expect(page.getByTestId("history")).toContainText("Nothing set aside yet");
  await page.goto("/app");
  await page.getByTestId("feed-button").click();
  await expect(page.getByTestId("celebration")).toBeVisible();
  await expect(page.getByTestId("feed-button")).toBeDisabled();
  await page.goto("/app/history");
  await expect(page.getByTestId("history")).toContainText("100 $CHOG set aside");
});

test("a demo user can change pets, skip a morning, and start over", async ({ page }) => {
  await page.goto("/app/jar");
  await page.getByTestId("goal-50").click();
  await expect(page.getByTestId("feed-button")).toHaveText("Set aside 50 $CHOG");
  await page.getByTestId("feed-button").click();
  await expect(page).toHaveURL(/\/app\/jar\/done/);
  await expect(page.locator("[data-testid='saved-amount']:visible")).toContainText("50 $CHOG");
  await page.goto("/app/streak");
  await page.getByTestId("tomorrow-button").click();
  await expect(page.getByTestId("demo-date")).toBeVisible();
  await page.goto("/app");
  await page.getByTestId("feed-button").click();
  await expect(page.getByTestId("streak-count")).toHaveText("2 day streak");
  await page.goto("/app/pets");
  await page.getByRole("button", { name: "Quiet One" }).click();
  await page.goto("/app/traits");
  await expect(page.getByTestId("trait-list")).toBeVisible();
  await page.goto("/app/settings");
  await page.getByTestId("reset-button").click();
  await expect(page.getByTestId("pet-name")).toHaveText("Bubblegum Chog");
  await expect(page.getByTestId("saved-amount")).toContainText("0 $CHOG");
  await page.goto("/app/history");
  await expect(page.getByTestId("history")).toContainText("Nothing set aside yet");
});

test("taking money back confirms, succeeds, and keeps the streak", async ({ page }) => {
  await page.goto("/app/jar/confirm");
  await expect(page.getByRole("heading", { name: "Jar is empty" })).toBeVisible();
  await page.goto("/app");
  await page.getByTestId("feed-button").click();
  await page.goto("/app/jar");
  await page.getByTestId("withdraw-button").click();
  await expect(page).toHaveURL(/\/app\/jar\/confirm/);
  await page.getByRole("link", { name: "Cancel" }).click();
  await expect(page).toHaveURL(/\/app\/jar$/);
  await page.getByTestId("withdraw-button").click();
  await page.getByTestId("confirm-withdraw").click();
  await expect(page).toHaveURL(/\/app\/jar\/done/);
  await expect(page.locator("[data-testid='saved-amount']:visible")).toContainText("0 $CHOG");
  await expect(page.locator("[data-testid='streak-count']:visible")).toContainText("1 day streak");
  await page.goto("/app");
  await expect(page.getByTestId("mood-line")).toContainText("still yours");
});

test("a returning day follows the streak rewards", async ({ page }) => {
  await page.goto("/app");
  await page.getByTestId("feed-button").click();
  await page.goto("/app/streak");
  await expect(page.getByText("Nibbling")).toBeVisible();
  await expect(page.getByText("Unlocked").first()).toBeVisible();
  await page.getByTestId("tomorrow-button").click();
  await page.goto("/app");
  await expect(page.getByTestId("mood")).toHaveAttribute("data-mood", "waiting");
  await page.getByTestId("feed-button").click();
  await page.goto("/app/streak");
  await expect(page.getByTestId("streak-count")).toHaveText("2 day streak");
  await expect(page.getByRole("heading", { name: "Cozy" })).toBeVisible();
});

test("connect without a wallet explains itself and returns to the samples", async ({ page }) => {
  await page.goto("/app/pets");
  await expect(page.getByTestId("wallet-pets")).toContainText("No wallet yet");
  await page.goto("/app/settings");
  await expect(page.getByTestId("settings-wallet")).toContainText("Not connected");
  await page.getByTestId("use-wallet").click();
  await expect(page.getByTestId("connect-wallet")).toBeVisible();
  await page.getByTestId("connect-wallet").click();
  await expect(page.getByTestId("connect-error")).toContainText("No wallet found");
  await page.getByTestId("back-to-demo").click();
  await expect(page.getByTestId("pet-name")).toHaveText("Bubblegum Chog");
});

test("a connected wallet on the wrong chain, and one with no Chog, are real states", async ({ page }) => {
  await page.addInitScript(() => {
    const listeners: Record<string, Array<(value: string) => void>> = {};
    let chainId = "0x1";
    const ethereum = {
      isMetaMask: true,
      request: async ({ method, params }: { method: string; params?: [{ chainId: string }] }) => {
        if (method === "eth_chainId") return chainId;
        if (method === "net_version") return chainId === "0x8f" ? "143" : "1";
        if (method === "eth_accounts") return [];
        if (method === "eth_requestAccounts" || method === "eth_requestAccounts") {
          return ["0x1111111111111111111111111111111111111111"];
        }
        if (method === "wallet_requestPermissions") return [{ parentCapability: "eth_accounts" }];
        if (method === "wallet_switchEthereumChain") {
          chainId = params?.[0]?.chainId ?? chainId;
          for (const listener of listeners.chainChanged ?? []) listener(chainId);
          return null;
        }
        return "0x";
      },
      on(event: string, cb: (value: string) => void) {
        listeners[event] = listeners[event] ?? [];
        listeners[event].push(cb);
      },
      removeListener() {},
    };
    Object.assign(window, { ethereum });
  });
  await page.goto("/connect");
  await page.getByTestId("connect-wallet").click();
  await expect(page.getByTestId("wrong-network")).toBeVisible();
  await page.getByRole("button", { name: "Switch to Monad" }).click();
  await expect(page.getByTestId("no-chog").or(page.getByTestId("chain-error")).or(page.getByTestId("wallet-loading"))).toBeVisible({
    timeout: 20_000,
  });
});
