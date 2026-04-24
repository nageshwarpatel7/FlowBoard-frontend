# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: basic.spec.ts >> basic check
- Location: e2e\basic.spec.ts:3:5

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /FlowBoard/
Received string:  "FlowboardUi"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    9 × unexpected value "FlowboardUi"

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
  1 | import { test, expect } from '@playwright/test';
  2 | 
  3 | test('basic check', async ({ page }) => {
  4 |   console.log('Navigating to http://[::1]:4200');
  5 |   await page.goto('/', { timeout: 60000 });
  6 |   console.log('Navigation complete');
> 7 |   await expect(page).toHaveTitle(/FlowBoard/);
    |                      ^ Error: expect(page).toHaveTitle(expected) failed
  8 | });
  9 | 
```