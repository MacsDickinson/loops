# Clerk Test Environment Setup Guide

This guide explains how to provision a Clerk test environment for automated e2e testing with Playwright.

## Overview

The e2e tests in `src/e2e/auth.spec.ts` currently verify infrastructure (pages load, redirects work) but cannot test actual authentication flows without a dedicated Clerk test environment.

This guide provides:
1. Clerk test application setup
2. Test account strategy
3. Secure credential handling for CI/local Playwright runs

## 1. Create Clerk Test Application

### Step 1: Sign up/login to Clerk
- Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
- Create an account or sign in

### Step 2: Create Test Application
1. Click "Add application" or "Create Application"
2. **Name**: `Discovery Loop - Test` (or `Discovery Loop - E2E`)
3. **Sign-in options**: Enable "Email" (required for test accounts)
4. **Environment**: Development (free tier is sufficient for testing)

### Step 3: Get API Keys
1. Navigate to **API Keys** in the left sidebar
2. Copy the following keys:
   - `Publishable key` (starts with `pk_test_`)
   - `Secret key` (starts with `sk_test_`)

**Important**: These are TEST keys, separate from your production Clerk application.

### Step 4: Configure Sign-in/Sign-up Settings
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable **Email address** as an identifier
3. Under **Authentication strategies**, enable **Password**
4. **Verification**: For test environment, you can disable email verification:
   - Go to **User & Authentication** → **Email, Phone, Username**
   - Toggle "Verify email address" to OFF (test only!)
   - This allows automated tests to create accounts without email verification

### Step 5: Create Test User (Optional)
You have two options for test accounts:

**Option A: Pre-seeded test user** (Recommended for CI)
1. Go to **Users** in Clerk dashboard
2. Click "Create user"
3. Email: `test-user@loops-e2e.test`
4. Password: Generate a secure password (store in 1Password/secrets manager)
5. Skip email verification

**Option B: Dynamic test accounts** (Recommended for parallel tests)
- Tests create unique users on-demand using `test-${timestamp}@loops-e2e.test`
- Requires email verification disabled (see Step 4)
- Cleanup: Periodically delete test users via Clerk dashboard or API

## 2. Configure Environment Variables

### Local Development

Create `src/.env.test.local` (gitignored):

```bash
# Clerk Test Environment (for e2e tests)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# Test user credentials (if using pre-seeded account)
TEST_USER_EMAIL=test-user@loops-e2e.test
TEST_USER_PASSWORD=your-secure-test-password

# Other required env vars (can use dev values)
ANTHROPIC_API_KEY=sk-ant-xxx
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### CI Environment (GitHub Actions)

Add the following secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add **Repository secrets**:
   - `CLERK_PUBLISHABLE_KEY_TEST` → `pk_test_xxxxx`
   - `CLERK_SECRET_KEY_TEST` → `sk_test_xxxxx`
   - `TEST_USER_EMAIL` → `test-user@loops-e2e.test`
   - `TEST_USER_PASSWORD` → your secure password

## 3. Update Playwright Configuration

The `playwright.config.ts` needs access to test credentials. Update it to load from `.env.test.local`:

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test.local') });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      // Ensure test server uses test Clerk keys
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
    },
  },
});
```

## 4. Test Account Strategy

### Recommended Approach: Pre-seeded Test User

**Pros:**
- Predictable credentials
- No cleanup needed
- Faster test execution
- Works well in CI

**Cons:**
- Single user limits parallel test scenarios
- Potential race conditions if tests modify user state

**Implementation:**

```typescript
// e2e/helpers/auth.ts
import { Page } from '@playwright/test';

export async function signInTestUser(page: Page) {
  await page.goto('/sign-in');

  await page.fill('input[name="identifier"]', process.env.TEST_USER_EMAIL!);
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard or home
  await page.waitForURL(/\/dashboard|\//, { timeout: 5000 });
}
```

### Alternative: Dynamic Test Accounts

For parallel test execution or user-creation flows:

```typescript
export async function createUniqueTestUser(page: Page) {
  const timestamp = Date.now();
  const email = `test-${timestamp}@loops-e2e.test`;
  const password = 'TestPassword123!';

  await page.goto('/sign-up');
  await page.fill('input[name="emailAddress"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  return { email, password };
}
```

**Note:** Requires email verification disabled in Clerk test app.

## 5. Update E2E Tests

Extend `src/e2e/auth.spec.ts` to include authenticated flows:

```typescript
import { test, expect } from '@playwright/test';
import { signInTestUser } from './helpers/auth';

test.describe('Authenticated User Flows', () => {
  test('should sign in and access protected dashboard', async ({ page }) => {
    await signInTestUser(page);

    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify user is authenticated (e.g., UserButton visible)
    await expect(page.getByRole('button', { name: /user/i })).toBeVisible();
  });

  test('should maintain session across page refresh', async ({ page }) => {
    await signInTestUser(page);
    await page.goto('/dashboard');

    // Refresh page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('button', { name: /user/i })).toBeVisible();
  });

  test('should sign out successfully', async ({ page }) => {
    await signInTestUser(page);

    // Click UserButton to open menu
    await page.getByRole('button', { name: /user/i }).click();

    // Click sign out
    await page.getByRole('button', { name: /sign out/i }).click();

    // Should redirect to sign-in or home
    await expect(page).toHaveURL(/\/sign-in|\//, { timeout: 5000 });
  });
});
```

## 6. Security Best Practices

### Credential Storage
- **Local**: Use `.env.test.local` (gitignored)
- **CI**: Use GitHub Secrets or equivalent secrets manager
- **Never commit** test credentials to version control

### Test Isolation
- Each test should start in unauthenticated state (Playwright's isolated contexts handle this)
- Use `test.beforeEach()` to set up auth state if needed
- Clean up test data after runs (if using dynamic accounts)

### Clerk Test vs Production
- **Always** use separate Clerk applications for test/production
- Test keys start with `pk_test_` / `sk_test_`
- Production keys start with `pk_live_` / `sk_live_`

## 7. Running E2E Tests

### Local
```bash
cd src
npm run test:e2e  # or `npx playwright test`
```

### CI (GitHub Actions example)
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd src && npm ci

      - name: Install Playwright browsers
        run: cd src && npx playwright install --with-deps

      - name: Run E2E tests
        run: cd src && npx playwright test
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY_TEST }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY_TEST }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

## 8. Troubleshooting

### Tests timeout at sign-in
- Verify Clerk test keys are correct in `.env.test.local`
- Check that email verification is disabled in Clerk dashboard
- Inspect Playwright trace: `npx playwright show-trace trace.zip`

### "User not found" errors
- Ensure test user exists in Clerk dashboard (for pre-seeded approach)
- For dynamic accounts, verify email verification is disabled

### Session not persisting
- Verify `ClerkProvider` is in `app/layout.tsx`
- Check browser cookies are enabled in Playwright config

### CI failures but local passes
- Ensure GitHub secrets are set correctly
- Check that CI environment variables match local `.env.test.local`

## Next Steps

1. **Create Clerk test application** (Step 1-3)
2. **Set up test credentials** (Step 2)
3. **Update Playwright config** (Step 3)
4. **Create auth helper functions** (Step 4-5)
5. **Run tests locally** to verify setup
6. **Configure CI secrets** (Step 2, CI section)

Once complete, the QA team can extend e2e tests to cover full authentication lifecycles for MAC-22 acceptance criteria.
