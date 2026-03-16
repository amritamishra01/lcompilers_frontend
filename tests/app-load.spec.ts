import { test, expect } from '@playwright/test';

test('playground loads successfully', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
});