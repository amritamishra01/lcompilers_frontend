import { test, expect } from '@playwright/test';

test('run button is present and UI remains stable', async ({ page }) => {
  await page.goto('/');

  const runButton = page.getByRole('button', { name: 'Run' });

  // 1. Verify UI components are present
  await expect(runButton).toBeVisible();

  // 2. Wait for the 'disabled' state to go away (with a generous timeout)
  // This is better than { force: true } because it actually waits for the app to be ready
  await expect(runButton).toBeEnabled({ timeout: 45000 });

  // 3. Click normally
  await runButton.click();

  // 4. Ensure app is still responsive
  await expect(runButton).toBeVisible();
});