import { test, expect, type Page } from "@playwright/test";

test("login shows avatar menu then logout returns Login", async ({ page }: { page: Page }) => {
  await page.goto("/login");

  await page.getByText(/sign up/i).click();

  const email = `user_${Date.now()}@example.com`;

  await page.getByPlaceholder(/enter your name/i).fill("Test User");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill("Password123!");
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page.getByRole("button", { name: /account menu/i })).toBeVisible();

  await page.getByRole("button", { name: /account menu/i }).click();
  await page.getByRole("menuitem", { name: /logout/i }).click();

  await expect(page.getByText(/log in/i)).toBeVisible();
});
