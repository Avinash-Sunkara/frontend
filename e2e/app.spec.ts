import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, email = "user@example.com", next = "/dashboard") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: /Password/ }).fill("password1");
  await page.getByRole("button", { name: /sign in/i }).click();
  const expectedPath = next === "/admin" ? "/dashboard" : new URL(next, "http://localhost").pathname;
  await page.waitForURL((url) => url.pathname === expectedPath);
  if (expectedPath === "/dashboard") await expect(page.getByRole("heading", { name: /keep pushing, asha/i })).toBeVisible();
}
const noHorizontalOverflow = async (page: Page) => {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, "page scrolls sideways").toBeLessThanOrEqual(1);
};

const PUBLIC = ["/", "/login", "/register", "/forgot-password", "/terms", "/privacy"];
for (const path of PUBLIC) {
  test(`public ${path}: renders, no horizontal overflow`, async ({ page }, info) => {
    await page.goto(path); await expect(page.locator("h1").first()).toBeVisible();
    await noHorizontalOverflow(page);
    await page.screenshot({ path: `e2e/shots/${info.project.name}${path === "/" ? "-landing" : path.replace(/\//g, "-")}.png`, fullPage: true });
  });
}

test("login → dashboard, then a popup appears and clears", async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /keep pushing, asha/i })).toBeVisible();
  await expect(page.getByText("New SQL Cheat Sheet is available")).toBeVisible();
  await expect(page.getByText("New SQL Cheat Sheet is available")).toBeHidden({ timeout: 9000 }); // ~5s auto-dismiss
  await noHorizontalOverflow(page);
});

test("wrong password shows an error", async ({ page }) => {
  await page.goto("/login"); await page.getByLabel("Email").fill("user@example.com"); await page.getByRole("textbox", { name: /Password/ }).fill("nope");
  await page.getByRole("button", { name: /sign in/i }).click(); await expect(page.getByRole("alert").filter({ hasText: /incorrect/i })).toBeVisible();
});

test("login shows Google and GitHub when social sign-in is not configured", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Google" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "GitHub" })).toBeDisabled();
  await expect(page.getByText(/social sign-in is disabled or not configured/i)).toBeVisible();
});

test("unauthenticated visit to /dashboard redirects to login", async ({ page }) => { await page.goto("/dashboard"); await expect(page).toHaveURL(/\/login/); });

test("DSA sheet: expand topic, mark solved, LeetCode opens in new tab", async ({ page, context }) => {
  await login(page, "user@example.com", "/sheets");
  await expect(page.getByRole("heading", { name: /learn patterns/i })).toBeVisible();
  await expect(page.getByText("Two Sum")).toBeVisible();
  // The in-memory mock persists across viewport projects, so normalize the first row first.
  const alreadySolved = page.getByRole("button", { name: "Mark unsolved" }).first();
  if (await alreadySolved.count()) await alreadySolved.click();
  await page.getByRole("button", { name: "Mark solved" }).first().click();
  await expect(page.getByRole("button", { name: "Mark unsolved" }).first()).toBeVisible();
  const link = page.getByRole("link", { name: "Solve on LeetCode" }).first();
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("href", /^https:\/\/leetcode\.com\/problems\//);
  await noHorizontalOverflow(page);
});

test("core CS reader shows topic content and 'On this page' on wide screens", async ({ page }, info) => {
  await login(page, "user@example.com", "/core-cs");
  await expect(page.getByRole("heading", { name: "SELECT" })).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) >= 1280) await expect(page.getByText("ON THIS PAGE")).toBeVisible();
  await noHorizontalOverflow(page);
});

test("notes: PDF renders in the protected viewer without download UI", async ({ page }) => {
  await login(page, "user@example.com", "/notes/n1");
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: /download/i })).toHaveCount(0);
  await expect(page.getByLabel("Search in document")).toBeVisible();
});

test("premium note shows paywall with Pay Now", async ({ page }) => {
  await login(page, "user@example.com", "/notes/n2");
  await expect(page.getByText("Premium Content")).toBeVisible(); await expect(page.getByRole("button", { name: /pay now/i })).toBeVisible();
});

test("non-admin cannot use /admin; admin can", async ({ page }) => {
  await login(page, "user@example.com", "/admin"); await expect(page).toHaveURL(/\/dashboard/);
});
test("admin login → overview", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("link", { name: /forgot password/i })).toHaveAttribute("href", "/forgot-password");
  const email = page.getByLabel("Email"); await email.fill("admin@example.com"); await expect(email).toHaveValue("admin@example.com");
  await page.getByRole("textbox", { name: /Password/ }).fill("password1"); await expect(email).toHaveValue("admin@example.com");
  const response = page.waitForResponse((r) => new URL(r.url()).pathname.endsWith("/admin/auth/login") && r.request().method() === "POST");
  await page.getByRole("button", { name: /sign in/i }).click();
  expect((await response).status()).toBe(200);
  await expect(page).toHaveURL(/\/admin\/?$/); await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({ timeout: 15_000 }); await noHorizontalOverflow(page);
});

test("every main page loads without console errors or overflow", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(e.message));
  await login(page);
  for (const p of ["/dashboard", "/sheets", "/core-cs", "/aptitude", "/roadmaps", "/roadmaps/r1", "/notes", "/cheat-sheets", "/interviews", "/interviews/i1", "/revision", "/bookmarks", "/activity", "/profile", "/search?q=sum"]) {
    await page.goto(p, { waitUntil: "domcontentloaded" }); await noHorizontalOverflow(page);
  }
  expect(errors).toEqual([]);
});

test("landing DSA pattern visualizer supports traces, controls, and custom input", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const patterns = ["Sliding Window", "Monotonic Stack", "Binary Search on Answers", "Kadane's Algorithm", "Prefix Sum", "Two-Pointer"];
  await expect(page.getByRole("tablist", { name: "DSA algorithm patterns" })).toBeVisible();
  await noHorizontalOverflow(page);

  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  await tabs.first().press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Monotonic Stack" })).toBeFocused();

  await page.getByRole("tab", { name: "Sliding Window" }).click();
  let visualizer = page.getByRole("group", { name: "Sliding Window interactive visualization" });
  await visualizer.focus();
  await visualizer.press("ArrowRight");
  await expect(visualizer.getByText(/^Step 2 of/)).toBeVisible();
  await visualizer.getByRole("button", { name: "Reset visualization" }).click();
  await visualizer.getByRole("button", { name: "Play visualization" }).click();
  await expect(visualizer.getByText(/^Step 2 of/)).toBeVisible({ timeout: 3000 });
  await visualizer.getByRole("button", { name: "Pause visualization" }).click();

  await visualizer.getByRole("textbox", { name: "Input array" }).fill("2, 3, 5");
  await visualizer.getByRole("spinbutton", { name: "Window size (k)" }).fill("2");
  await visualizer.getByRole("button", { name: "Run input" }).click();
  await expect(visualizer.getByRole("list", { name: "Array values" }).getByRole("listitem")).toHaveCount(3);
  await visualizer.getByRole("button", { name: "Reset visualization" }).click();
  await expect(visualizer.getByText(/^Step 1 of 8/)).toBeVisible();

  for (const pattern of patterns) {
    await page.getByRole("tab", { name: pattern }).click();
    visualizer = page.getByRole("group", { name: `${pattern} interactive visualization` });
    await expect(visualizer.getByRole("list", { name: "Array values" })).toBeVisible();
    const next = visualizer.getByRole("button", { name: "Next step" });
    while (await next.isEnabled()) await next.click();
    await expect(visualizer.getByText("Time", { exact: true })).toBeVisible();
    await expect(visualizer.getByText("Space", { exact: true })).toBeVisible();
  }

  await noHorizontalOverflow(page);
});
