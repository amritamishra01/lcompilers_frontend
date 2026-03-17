import { test, expect } from '@playwright/test';

test('editor accepts input and re-initializes correctly after reload', async ({ page }) => {
  await page.goto('/');

  // 1. Focus the editor and type
  const editorInput = page.locator('.ace_text-input').first();
  await editorInput.focus();
  await page.keyboard.type('Hello LFortran');

  // 2. Verify UI shows the change (Interaction works)
  await expect(page.locator('.ace_content')).toContainText('Hello LFortran');

  // 3. Reload the page
  await page.reload();
  
  // 4. Wait for the editor to boot up again
  await page.waitForTimeout(3000);

  // 5. Verification: Check that the default program is back 
  // and the editor is visible/responsive (Stability check)
  await expect(page.locator('.ace_content')).toContainText('program mandelbrot');
  await expect(page.locator('.ace_content')).toBeVisible();
});