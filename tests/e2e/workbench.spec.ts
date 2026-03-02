import { expect, test } from "@playwright/test";

test.describe("ResumeDB workbench", () => {
  test("loads resume-first by default and can execute starter query", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /brian's resume/i })).toBeVisible();
    await expect(page.getByLabel("Standard resume view")).toBeVisible();

    await page.getByRole("button", { name: "SQL" }).click();
    await page.getByTitle("Run (Cmd/Ctrl + Enter)").click();
    await expect(page.locator(".wb-query-status")).toContainText(/row\(s\) returned/i);
  });

  test("resume shortcuts open and execute SQL queries", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Open Skills Matrix in SQL/i }).click();
    await expect(page.locator(".wb-query-status")).toContainText(/row\(s\) returned/i);
    await expect(page.locator(".wb-query-tab--active")).toContainText(/v_skills_matrix/i);
  });
});
