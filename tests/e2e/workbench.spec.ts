import { expect, test } from "@playwright/test";

test.describe("ResumeDB workbench", () => {
  test("loads and executes starter query", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /sql portfolio console/i })).toBeVisible();

    await page.getByRole("button", { name: /run \(cmd\/ctrl \+ enter\)/i }).click();
    await expect(page.getByText(/profile/i).first()).toBeVisible();
  });

  test("runs recommended query sequence", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /run recommended queries/i }).click();

    await expect(page.getByText(/profile snapshot/i).first()).toBeVisible();
    await expect(page.getByText(/best work: reliability/i).first()).toBeVisible();
  });
});
