import { expect, test } from "@playwright/test";

test.describe("ResumeDB workbench", () => {
  test("loads and executes starter query", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /mysql workbench/i })).toBeVisible();

    await page.getByRole("button", { name: /execute query/i }).click();
    await expect(page.getByText(/row\(s\)/i).first()).toBeVisible();
  });

  test("runs recommended query sequence", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /run recommended queries/i }).click();
    await expect(page.getByText(/best_work_reliability/i)).toBeVisible();
  });
});
