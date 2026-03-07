# E2E Tests

End-to-end tests for the Discovery Loop application using Playwright.

## Setup

### First Time Setup

1. **Install dependencies**
   ```bash
   cd src
   npm install
   npx playwright install --with-deps
   ```

2. **Configure test environment**

   See [Clerk Test Environment Setup Guide](../../docs/clerk-test-environment-setup.md) for detailed instructions.

   Quick steps:
   - Create a Clerk test application
   - Create a test user (or enable dynamic users)
   - Copy `.env.test.local.example` to `.env.test.local`
   - Fill in your Clerk test keys and test user credentials

### Running Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test auth.spec.ts

# Run with debug
npx playwright test --debug
```

## Test Files

- **`auth.spec.ts`** - Infrastructure tests (no credentials required)
  - Tests that auth pages load
  - Tests that protected routes redirect
  - Tests that Clerk is properly integrated

- **`auth-authenticated.spec.ts`** - Authenticated flow tests (requires test credentials)
  - Sign in/sign out flows
  - Session persistence
  - Protected route access

## Test Helpers

- **`helpers/auth.ts`** - Authentication helper functions
  - `signInTestUser()` - Sign in with pre-seeded test user
  - `createUniqueTestUser()` - Create dynamic test account
  - `signOutUser()` - Sign out current user
  - `isAuthenticated()` - Check if user is authenticated

## Environment Variables

Tests use `.env.test.local` for configuration. Required variables:

```bash
# Clerk test environment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Test user credentials
TEST_USER_EMAIL=test-user@loops-e2e.test
TEST_USER_PASSWORD=your-secure-password

# Other services (can use dev values)
ANTHROPIC_API_KEY=sk-ant-xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

## CI/CD

For GitHub Actions or other CI systems, set the same environment variables as secrets:

- `CLERK_PUBLISHABLE_KEY_TEST`
- `CLERK_SECRET_KEY_TEST`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

See [setup guide](../../docs/clerk-test-environment-setup.md#ci-environment-github-actions) for example workflow.

## Troubleshooting

### Tests timeout at sign-in
- Verify Clerk test keys in `.env.test.local`
- Check test user exists in Clerk dashboard
- Ensure email verification is disabled for test app

### "User not found" errors
- Create test user in Clerk dashboard
- Or enable dynamic users (requires email verification disabled)

### Session not persisting
- Verify `ClerkProvider` in `app/layout.tsx`
- Check browser cookies enabled in Playwright config

For more help, see the [Troubleshooting section](../../docs/clerk-test-environment-setup.md#troubleshooting) in the setup guide.
