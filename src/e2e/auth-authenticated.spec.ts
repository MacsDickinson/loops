import { test, expect } from '@playwright/test';
import { signInTestUser, signOutUser, isAuthenticated } from './helpers/auth';

/**
 * Authenticated User E2E Tests
 *
 * These tests require a Clerk test environment with credentials configured.
 * See docs/clerk-test-environment-setup.md for setup instructions.
 *
 * Prerequisites:
 * - Clerk test application created
 * - Test user created in Clerk dashboard
 * - .env.test.local configured with TEST_USER_EMAIL and TEST_USER_PASSWORD
 */

// Check if test credentials are available
const hasTestCredentials = !!(
  process.env.TEST_USER_EMAIL &&
  process.env.TEST_USER_PASSWORD
);

const describeOrSkip = hasTestCredentials ? test.describe : test.describe.skip;

describeOrSkip('Authenticated User Flows', () => {

  test('should sign in and access protected dashboard', async ({ page }) => {
    // Sign in with test credentials
    await signInTestUser(page);

    // Should be on dashboard after sign-in
    await expect(page).toHaveURL('/dashboard');

    // Verify user is authenticated
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(true);
  });

  test('should maintain session across page refresh', async ({ page }) => {
    // Sign in
    await signInTestUser(page);
    await page.goto('/dashboard');

    // Verify initial auth state
    await expect(page).toHaveURL('/dashboard');

    // Refresh page
    await page.reload();

    // Should still be authenticated after reload
    await expect(page).toHaveURL('/dashboard');

    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(true);
  });

  test('should maintain session when navigating between pages', async ({ page }) => {
    // Sign in
    await signInTestUser(page);

    // Navigate to home
    await page.goto('/');

    // Should remain authenticated
    const authenticatedOnHome = await isAuthenticated(page);
    expect(authenticatedOnHome).toBe(true);

    // Navigate back to dashboard
    await page.goto('/dashboard');

    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard');
  });

  test('should sign out successfully', async ({ page }) => {
    // Sign in first
    await signInTestUser(page);

    // Verify we're authenticated
    const authenticatedBefore = await isAuthenticated(page);
    expect(authenticatedBefore).toBe(true);

    // Sign out
    await signOutUser(page);

    // Should redirect to sign-in or home
    await expect(page).toHaveURL(/\/sign-in|\//, { timeout: 5000 });

    // Attempting to access dashboard should now redirect
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*sign-in.*/);
  });

  test('should prevent access to protected routes after sign-out', async ({ page }) => {
    // Sign in
    await signInTestUser(page);

    // Access dashboard (should work)
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Sign out
    await signOutUser(page);

    // Try to access dashboard again (should redirect)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*sign-in.*/);
  });
});

test.describe('Sign-up Flow (if using dynamic test accounts)', () => {
  // Uncomment this test if you want to test dynamic account creation
  // Requires email verification disabled in Clerk test environment

  test.skip('should create new user and sign in automatically', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test-${timestamp}@loops-e2e.test`;
    const password = 'TestPassword123!';

    await page.goto('/sign-up');

    // Wait for Clerk sign-up form
    await page.waitForSelector('input[name="emailAddress"]', { timeout: 5000 });

    // Fill in new user details
    await page.fill('input[name="emailAddress"]', email);
    await page.fill('input[name="password"]', password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should automatically sign in after sign-up
    await page.waitForURL(/\/dashboard|\//, { timeout: 10000 });

    // Verify user is authenticated
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(true);
  });
});

/**
 * Note: Authenticated tests are automatically skipped when TEST_USER_EMAIL and TEST_USER_PASSWORD
 * are not set. This allows the infrastructure tests (auth.spec.ts) to run in any environment,
 * while authenticated tests only run when proper credentials are configured.
 *
 * Current status: ${hasTestCredentials ? 'ENABLED (credentials found)' : 'SKIPPED (no credentials)'}
 *
 * To enable these tests:
 * 1. See docs/clerk-test-environment-setup.md
 * 2. Create .env.test.local with your test credentials
 * 3. Run: npm run test:e2e
 */
