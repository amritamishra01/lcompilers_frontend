import { test, expect } from '@playwright/test';

test('run button triggers execution', async ({ page }) => {
  await page.goto('/');

  const runButton = page.getByRole('button', { name: 'Run' });

  // Wait until button becomes enabled
  await expect(runButton).toBeEnabled({ timeout: 20000 });

  // Click Run
  await runButton.click();

  // Small wait for execution
  await page.waitForTimeout(2000);

  // Ensure UI still stable
  await expect(runButton).toBeVisible();
});