import { test, expect } from '@playwright/test';

test('basic check', async ({ page }) => {
  console.log('Navigating to http://[::1]:4200');
  await page.goto('/', { timeout: 60000 });
  console.log('Navigation complete');
  await expect(page).toHaveTitle(/FlowBoard/);
});
