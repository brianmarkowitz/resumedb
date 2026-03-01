import { expect, test } from "@playwright/test";

test.describe("ResumeDB workbench", () => {
  test("loads and executes starter query", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /mysql workbench/i })).toBeVisible();

    await page.getByTitle("Run (Cmd/Ctrl + Enter)").click();
    await expect(page.locator(".wb-query-status")).toContainText(/row\(s\) returned/i);
  });

  test("runs recommended query sequence", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /run recommended queries/i }).first().click();
    await expect(page.locator(".wb-query-status")).toContainText(/ran recommended resume storyline queries/i);
    await expect(page.locator(".wb-query-tab")).toHaveCount(6);
  });
});
