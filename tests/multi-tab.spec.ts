import { test, expect } from '@playwright/test';

test('multiple tabs do not crash UI', async ({ page }) => {
  await page.goto('/');

  const tabs = page.locator('.ant-tabs-tab');
  const count = await tabs.count();

  if (count > 1) {
    await tabs.nth(1).click();
    await tabs.nth(0).click();
  }

  await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
});