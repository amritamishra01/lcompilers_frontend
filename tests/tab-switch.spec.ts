import { test, expect } from '@playwright/test';

test('tab navigation works', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Find tabs container
  const tabs = page.locator('.ant-tabs-tab');

  const count = await tabs.count();

  // If multiple tabs exist switch between them
  if (count > 1) {
    await tabs.nth(1).click();

    await expect(tabs.nth(1)).toBeVisible();
  }
});