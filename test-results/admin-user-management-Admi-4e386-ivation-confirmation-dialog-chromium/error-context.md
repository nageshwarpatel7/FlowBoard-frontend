# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-user-management.spec.ts >> Admin User Management >> should show reactivation confirmation dialog
- Location: e2e\admin-user-management.spec.ts:90:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('tr:has-text("Inactive User")').locator('[id^="user-action-"]')

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - generic [ref=e8]: ⚡
    - generic [ref=e9]: FlowBoard
  - heading "Sign in to your workspace" [level=1] [ref=e10]
  - generic [ref=e11]:
    - generic [ref=e12]: Email address
    - textbox "you@example.com" [ref=e17]
    - generic [ref=e19]: Password
    - generic [ref=e22]:
      - textbox "Enter your password" [ref=e24]
      - button [ref=e26] [cursor=pointer]:
        - img [ref=e27]: visibility_off
    - button "Forgot password?" [ref=e32] [cursor=pointer]
    - button "Sign in" [disabled]:
      - generic: Sign in
  - generic [ref=e34]: or
  - link "Continue with Google" [ref=e35] [cursor=pointer]:
    - /url: http://localhost:8081/oauth2/authorization/google
    - img [ref=e36]
    - text: Continue with Google
  - generic [ref=e41]:
    - text: Don't have an account?
    - link "Create one" [ref=e42] [cursor=pointer]:
      - /url: /register
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Admin User Management', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Mock the auth state to appear as a Platform Admin
  6   |     await page.addInitScript(() => {
  7   |       const mockUser = {
  8   |         id: 1,
  9   |         fullName: 'Test Admin',
  10  |         email: 'admin@test.com',
  11  |         role: 'PLATFORM_ADMIN',
  12  |         active: true
  13  |       };
  14  |       localStorage.setItem('user', JSON.stringify(mockUser));
  15  |       localStorage.setItem('token', 'mock-jwt-token');
  16  |     });
  17  | 
  18  |     // Mock API responses
  19  |     await page.route('**/api/v1/auth/admin/stats', async (route) => {
  20  |       await route.fulfill({
  21  |         status: 200,
  22  |         contentType: 'application/json',
  23  |         body: JSON.stringify({
  24  |           totalUsers: 10,
  25  |           totalWorkspaces: 5,
  26  |           totalBoards: 20,
  27  |           activeUsersToday: 3
  28  |         })
  29  |       });
  30  |     });
  31  | 
  32  |     await page.route('**/api/v1/auth/admin/users', async (route) => {
  33  |       await route.fulfill({
  34  |         status: 200,
  35  |         contentType: 'application/json',
  36  |         body: JSON.stringify([
  37  |           {
  38  |             id: 1,
  39  |             fullName: 'Active User',
  40  |             username: 'active',
  41  |             email: 'active@test.com',
  42  |             role: 'MEMBER',
  43  |             active: true,
  44  |             emailVerified: true,
  45  |             createdAt: new Date().toISOString()
  46  |           },
  47  |           {
  48  |             id: 2,
  49  |             fullName: 'Inactive User',
  50  |             username: 'inactive',
  51  |             email: 'inactive@test.com',
  52  |             role: 'MEMBER',
  53  |             active: false,
  54  |             emailVerified: true,
  55  |             createdAt: new Date().toISOString()
  56  |           }
  57  |         ])
  58  |       });
  59  |     });
  60  |   });
  61  | 
  62  |   test('should show correct action buttons based on user status', async ({ page }) => {
  63  |     await page.goto('/admin');
  64  | 
  65  |     // Wait for the table to load
  66  |     await expect(page.locator('#users-table')).toBeVisible();
  67  | 
  68  |     // --- Check Active User ---
  69  |     const activeUserRow = page.locator('tr:has-text("Active User")');
  70  |     await activeUserRow.locator('[id^="user-action-"]').click();
  71  | 
  72  |     // Should see "Deactivate Account"
  73  |     await expect(page.getByText('Deactivate Account')).toBeVisible();
  74  |     // Should NOT see "Reactivate Account"
  75  |     await expect(page.getByText('Reactivate Account')).not.toBeVisible();
  76  | 
  77  |     // Close menu by clicking away
  78  |     await page.mouse.click(0, 0);
  79  | 
  80  |     // --- Check Inactive User ---
  81  |     const inactiveUserRow = page.locator('tr:has-text("Inactive User")');
  82  |     await inactiveUserRow.locator('[id^="user-action-"]').click();
  83  | 
  84  |     // Should see "Reactivate Account"
  85  |     await expect(page.getByText('Reactivate Account')).toBeVisible();
  86  |     // Should NOT see "Deactivate Account"
  87  |     await expect(page.getByText('Deactivate Account')).not.toBeVisible();
  88  |   });
  89  | 
  90  |   test('should show reactivation confirmation dialog', async ({ page }) => {
  91  |     await page.goto('/admin');
  92  | 
  93  |     const inactiveUserRow = page.locator('tr:has-text("Inactive User")');
> 94  |     await inactiveUserRow.locator('[id^="user-action-"]').click();
      |                                                           ^ Error: locator.click: Test timeout of 60000ms exceeded.
  95  | 
  96  |     // Click Reactivate
  97  |     await page.getByText('Reactivate Account').click();
  98  | 
  99  |     // Verify confirmation dialog
  100 |     await expect(page.getByText('Reactivate Account', { exact: true }).nth(0)).toBeVisible(); // Dialog title
  101 |     await expect(page.getByText('Are you sure you want to reactivate Inactive User\'s account?')).toBeVisible();
  102 |     await expect(page.getByRole('button', { name: 'Reactivate' })).toBeVisible();
  103 |   });
  104 | });
  105 | 
```