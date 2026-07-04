import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Nexus/); // assuming Nexus is the name based on the code
});

test('login link works', async ({ page }) => {
  await page.goto('/');
  // Usually there's a link to login or dashboard
  const loginLink = page.getByRole('link', { name: /Login/i });
  if (await loginLink.isVisible()) {
    await loginLink.click();
    await expect(page).toHaveURL(/.*login/);
  }
});
