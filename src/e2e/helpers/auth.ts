import { Page } from '@playwright/test';

/**
 * Authentication helper functions for e2e tests
 *
 * Requires test environment variables:
 * - TEST_USER_EMAIL
 * - TEST_USER_PASSWORD
 *
 * See docs/clerk-test-environment-setup.md for setup instructions
 */

/**
 * Sign in with pre-seeded test user credentials
 *
 * @param page - Playwright page object
 * @throws Error if TEST_USER_EMAIL or TEST_USER_PASSWORD not set
 */
export async function signInTestUser(page: Page) {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set. ' +
      'See docs/clerk-test-environment-setup.md for setup instructions.'
    );
  }

  await page.goto('/sign-in');

  // Wait for Clerk sign-in form to load
  await page.waitForSelector('input[name="identifier"]', { timeout: 5000 });

  // Fill in credentials
  await page.fill('input[name="identifier"]', email);
  await page.fill('input[name="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect after successful sign-in
  await page.waitForURL(/\/dashboard|\//, { timeout: 10000 });
}

/**
 * Create a unique test user account (for dynamic test accounts)
 *
 * Requires email verification disabled in Clerk test environment
 *
 * @param page - Playwright page object
 * @returns Object with email and password for the created user
 */
export async function createUniqueTestUser(page: Page): Promise<{ email: string; password: string }> {
  const timestamp = Date.now();
  const email = `test-${timestamp}@loops-e2e.test`;
  const password = 'TestPassword123!';

  await page.goto('/sign-up');

  // Wait for Clerk sign-up form to load
  await page.waitForSelector('input[name="emailAddress"]', { timeout: 5000 });

  // Fill in new user details
  await page.fill('input[name="emailAddress"]', email);
  await page.fill('input[name="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect after successful sign-up
  await page.waitForURL(/\/dashboard|\//, { timeout: 10000 });

  return { email, password };
}

/**
 * Sign out the current user
 *
 * @param page - Playwright page object
 */
export async function signOutUser(page: Page) {
  // Navigate to a page where UserButton is visible (dashboard)
  await page.goto('/dashboard');

  // Click UserButton to open menu
  // Note: Selector may need adjustment based on actual Clerk UserButton implementation
  await page.getByRole('button', { name: /user/i }).click();

  // Click sign out option
  await page.getByRole('button', { name: /sign out/i }).click();

  // Wait for redirect to sign-in or home
  await page.waitForURL(/\/sign-in|\//, { timeout: 5000 });
}

/**
 * Check if user is authenticated by verifying URL and UserButton presence
 *
 * @param page - Playwright page object
 * @returns true if user appears to be authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check if we can access protected route without redirect
  await page.goto('/dashboard');

  const currentUrl = page.url();
  const isOnDashboard = currentUrl.includes('/dashboard');

  if (!isOnDashboard) {
    return false;
  }

  // Check for UserButton (indicates authenticated state)
  const userButtonCount = await page.getByRole('button', { name: /user/i }).count();

  return userButtonCount > 0;
}
