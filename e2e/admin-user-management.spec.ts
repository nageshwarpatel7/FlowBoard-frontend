import { test, expect } from '@playwright/test';

test.describe('Admin User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the auth state to appear as a Platform Admin
    await page.addInitScript(() => {
      const mockUser = {
        id: 1,
        fullName: 'Test Admin',
        email: 'admin@test.com',
        role: 'PLATFORM_ADMIN',
        active: true
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-jwt-token');
    });

    // Mock API responses
    await page.route('**/api/v1/auth/admin/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 10,
          totalWorkspaces: 5,
          totalBoards: 20,
          activeUsersToday: 3
        })
      });
    });

    await page.route('**/api/v1/auth/admin/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            fullName: 'Active User',
            username: 'active',
            email: 'active@test.com',
            role: 'MEMBER',
            active: true,
            emailVerified: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            fullName: 'Inactive User',
            username: 'inactive',
            email: 'inactive@test.com',
            role: 'MEMBER',
            active: false,
            emailVerified: true,
            createdAt: new Date().toISOString()
          }
        ])
      });
    });
  });

  test('should show correct action buttons based on user status', async ({ page }) => {
    await page.goto('/admin');

    // Wait for the table to load
    await expect(page.locator('#users-table')).toBeVisible();

    // --- Check Active User ---
    const activeUserRow = page.locator('tr:has-text("Active User")');
    await activeUserRow.locator('[id^="user-action-"]').click();

    // Should see "Deactivate Account"
    await expect(page.getByText('Deactivate Account')).toBeVisible();
    // Should NOT see "Reactivate Account"
    await expect(page.getByText('Reactivate Account')).not.toBeVisible();

    // Close menu by clicking away
    await page.mouse.click(0, 0);

    // --- Check Inactive User ---
    const inactiveUserRow = page.locator('tr:has-text("Inactive User")');
    await inactiveUserRow.locator('[id^="user-action-"]').click();

    // Should see "Reactivate Account"
    await expect(page.getByText('Reactivate Account')).toBeVisible();
    // Should NOT see "Deactivate Account"
    await expect(page.getByText('Deactivate Account')).not.toBeVisible();
  });

  test('should show reactivation confirmation dialog', async ({ page }) => {
    await page.goto('/admin');

    const inactiveUserRow = page.locator('tr:has-text("Inactive User")');
    await inactiveUserRow.locator('[id^="user-action-"]').click();

    // Click Reactivate
    await page.getByText('Reactivate Account').click();

    // Verify confirmation dialog
    await expect(page.getByText('Reactivate Account', { exact: true }).nth(0)).toBeVisible(); // Dialog title
    await expect(page.getByText('Are you sure you want to reactivate Inactive User\'s account?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reactivate' })).toBeVisible();
  });
});
