import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";

test("builder creates, reads, updates and deletes a persisted word list", async ({ page }) => {
  const name = `Browser CRUD ${Date.now()}`;
  await page.goto("/library");
  await page.getByRole("button", { name: "+ Create a new list" }).click();
  await page.getByLabel("List name", { exact: true }).fill(name);
  await page.getByLabel("Description", { exact: true }).fill("Playwright persistence check");
  await page.getByRole("button", { name: "Create list", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(`Created '${name}'`);
  await page.reload();
  await page.getByRole("button", { name, exact: false }).click();
  await expect(page.getByLabel("Description", { exact: true })).toHaveValue("Playwright persistence check");
  await page.getByLabel("List name", { exact: true }).fill(`${name} updated`);
  await page.getByRole("button", { name: "Update list", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(`Updated the '${name} updated'`);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Delete list", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Deleted the word list");
  await page.reload();
  await expect(page.getByRole("button", { name: `${name} updated`, exact: false })).toHaveCount(0);
});

test("user downloads and solves the stored Wordle output", async ({ page, request }, testInfo) => {
  const before = (await (await request.get("/api/metrics")).json()).data.successes;
  await page.goto("/library");
  await page.getByRole("button", { name: "Stored ship Wordle", exact: false }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download stored HTML" }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe("stored-ship-wordle.html");
  const file = testInfo.outputPath("wordle.html");
  await download.saveAs(file);
  await page.goto(pathToFileURL(file).href);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find the word: ship");
  for (const symbol of ["ʃ", "ɪ", "p"]) await page.locator(`button[data-symbol="${symbol}"]`).click();
  await page.getByRole("button", { name: "Submit guess" }).click();
  await expect(page.getByRole("status")).toHaveText("Correct. The English word is 'ship'.");
  expect((await (await request.get("/api/metrics")).json()).data.successes).toBe(before + 1);
});

test("user generates a stored Word Search and can select grid cells", async ({ page }, testInfo) => {
  await page.goto("/library");
  await page.getByRole("button", { name: "Stored four-phoneme search", exact: false }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download stored HTML" }).click();
  const file = testInfo.outputPath("word-search.html");
  await (await downloaded).saveAs(file);
  await page.goto(pathToFileURL(file).href);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Four-phoneme Word Search");
  await expect(page.locator("button.cell")).toHaveCount(100);
  await page.locator("button.cell").first().click();
  await expect(page.getByRole("status")).toContainText("Starting tile selected");
  await page.getByRole("button", { name: "Start again" }).click();
  await expect(page.getByRole("status")).toContainText("Choose the first tile");
});

test("dashboard shows failed exports, simulated records and reports", async ({ page, request }) => {
  const response = await request.get("/api/activities/not-found/export");
  expect(response.status()).toBe(404);
  await page.goto("/dashboard");
  await expect(page.getByText(/failed generation attempts in the observed history/)).toBeVisible();
  await page.getByRole("button", { name: "Add simulated records" }).click();
  await expect(page.getByText(/Sample data only/)).toBeVisible();
  await expect(page.locator(".metric-card").filter({ hasText: "Failed generations" }).locator("dd")).toHaveText("2");
  await page.goto("/reports");
  await page.getByLabel("Usage source").selectOption("simulated");
  await expect(page.getByRole("table").first()).toBeVisible();
  const csv = await request.get("/api/metrics?source=simulated&format=csv");
  expect(await csv.text()).toContain("source,day,attempts,successes,failures");
  expect((await request.get("/health")).status()).toBe(200);
});

test("visible page time is persisted after navigation", async ({ page, request }) => {
  const before = (await (await request.get("/api/metrics")).json()).data.visits;
  await page.goto("/wordle");
  await page.waitForTimeout(1300);
  await page.getByRole("navigation", { name: "Primary navigation", exact: true }).getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect.poll(async () => (await (await request.get("/api/metrics")).json()).data.visits).toBeGreaterThan(before);
});
