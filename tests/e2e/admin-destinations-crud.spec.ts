import { test, expect } from "@playwright/test";

test("admin destinations CRUD: create -> publish -> visible public -> edit -> delete", async ({ page }) => {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin12345";

  const uniq = Date.now();
  const slug = `e2e-dest-${uniq}`;

  // login
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /log in/i }).click();

  // go admin destinations
  await page.goto("/admin/destinations");
  await expect(page.getByText(/destinations management/i)).toBeVisible();

  // create
  await page.getByRole("link", { name: /new destination/i }).click();
  await expect(page.getByText(/new destination/i)).toBeVisible();

  await page.getByLabel("destination-title").fill(`E2E Destination ${uniq}`);
  await page.getByLabel("destination-slug").fill(slug);
  await page.getByLabel("destination-country").fill("Malaysia");
  await page.getByLabel("destination-city").fill("Kuala Lumpur");
  await page.getByLabel("destination-summary").fill("E2E summary");
  await page.getByLabel("destination-tags").fill("City, Nature");
  await page.getByLabel("destination-featured-image").fill("/uploads/destinations/example.png");
  await page.getByLabel("destination-published").check();
  await page.getByRole("button", { name: /^create$/i }).click();

  // should navigate to edit
  await expect(page.getByText(/edit destination/i)).toBeVisible();

  // public visible
  await page.goto("/destinations");
  await page.getByPlaceholder(/search destinations/i).fill("E2E Destination");
  await expect(page.getByText(new RegExp(`E2E Destination ${uniq}`, "i"))).toBeVisible();

  // edit
  await page.goto("/admin/destinations");
  await page.getByText(new RegExp(`E2E Destination ${uniq}`, "i")).scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: /edit/i }).first().click();

  await page.getByLabel("destination-title").fill(`E2E Destination ${uniq} Updated`);
  await page.getByRole("button", { name: /^save$/i }).click();

  // delete
  await page.goto("/admin/destinations");
  await page.getByText(new RegExp(`E2E Destination ${uniq} Updated`, "i")).scrollIntoViewIfNeeded();

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: /^delete$/i }).first().click();

  // verify removed from public
  await page.goto("/destinations");
  await page.getByPlaceholder(/search destinations/i).fill(`E2E Destination ${uniq} Updated`);
  await expect(page.getByText(/no destinations found/i)).toBeVisible();
});
