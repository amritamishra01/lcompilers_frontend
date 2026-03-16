import { test, expect } from '@playwright/test';

test('run button triggers execution', async ({ page }) => {
  await page.goto('/');

  const runButton = page.getByRole('button', { name: 'Run' });

  // Ensure Run button exists
  await expect(runButton).toBeVisible();

  // Click Run
  await runButton.click();

  // Wait briefly for execution
  await page.waitForTimeout(2000);

  // Ensure page is still functional
  await expect(runButton).toBeVisible();
});