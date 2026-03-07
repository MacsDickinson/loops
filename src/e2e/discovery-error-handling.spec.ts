import { test, expect } from '@playwright/test';

test.describe('Discovery API Error Handling', () => {
  test('shows retry action for retryable API errors and succeeds on retry', async ({ page }) => {
    let requestCount = 0;

    await page.route('**/api/discovery', async (route) => {
      requestCount += 1;

      if (requestCount === 1) {
        await route.fulfill({
          status: 504,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Request timeout',
            message: 'The request took too long due to a network issue. Please try again.',
            retryable: true,
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: '0:"Recovered response after retry."\n',
      });
    });

    await page.goto('/chat-demo');

    const input = page.getByPlaceholder(/Describe your feature idea/i);
    await input.fill('Help me write a search feature spec');
    await input.press('Enter');

    await expect(page.getByText(/request took too long due to a network issue/i)).toBeVisible();
    const retryButton = page.getByRole('button', { name: /retry last message/i });
    await expect(retryButton).toBeVisible();

    await retryButton.click();

    await expect(page.getByText('Recovered response after retry.')).toBeVisible();
    await expect(page.getByText(/request took too long due to a network issue/i)).not.toBeVisible();
    expect(requestCount).toBe(2);
  });

  test('does not show retry action for non-retryable API errors', async ({ page }) => {
    await page.route('**/api/discovery', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Please sign in to continue.',
          retryable: false,
        }),
      });
    });

    await page.goto('/chat-demo');

    const input = page.getByPlaceholder(/Describe your feature idea/i);
    await input.fill('Draft acceptance criteria');
    await input.press('Enter');

    await expect(page.getByText(/please sign in to continue/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /retry last message/i })).toHaveCount(0);
  });
});
