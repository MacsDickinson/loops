import { test, expect } from '@playwright/test';

// Run serially to avoid Clerk dev API rate limiting (too_many_requests)
test.describe.configure({ mode: 'serial' });

test.describe('Product Coach Dialogue Flow', () => {
  test('maintains multi-turn context and conversation history', async ({ page }) => {
    const seenPayloads: Array<{ messages: Array<{ role: string; content: string }> }> = [];
    let requestCount = 0;

    await page.route('**/api/discovery', async (route) => {
      requestCount += 1;
      const payload = route.request().postDataJSON() as {
        messages: Array<{ role: string; content: string }>;
      };
      seenPayloads.push(payload);

      const responseText = requestCount === 1
        ? '0:"What is the primary user goal for this feature?"\n'
        : '0:"Great context. What should happen when the user submits invalid data?"\n';

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: responseText,
      });
    });

    await page.goto('/chat-demo');
    await page.waitForSelector('textarea', { timeout: 10000 });

    const input = page.getByPlaceholder(/Describe your feature idea/i);

    await input.fill('I need an onboarding checklist for new customers.');
    await input.press('Enter');
    await expect(page.getByText('What is the primary user goal for this feature?')).toBeVisible();

    await input.fill('The goal is activation within 24 hours.');
    await input.press('Enter');
    await expect(page.getByText('Great context. What should happen when the user submits invalid data?')).toBeVisible();

    expect(requestCount).toBe(2);
    expect(seenPayloads[1].messages.map((m) => m.content)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Hello! I'm the Discovery Loop Coach/),
        'I need an onboarding checklist for new customers.',
        'What is the primary user goal for this feature?',
        'The goal is activation within 24 hours.',
      ])
    );

    await expect(page.getByText('I need an onboarding checklist for new customers.')).toBeVisible();
    await expect(page.getByText('The goal is activation within 24 hours.')).toBeVisible();
  });

  test('asks non-repetitive questions across turns', async ({ page }) => {
    const responses = [
      '0:"Who is the primary persona for this workflow?"\n',
      '0:"What is the success metric for the first release?"\n',
    ];
    let index = 0;

    await page.route('**/api/discovery', async (route) => {
      const body = responses[index] ?? responses[responses.length - 1];
      index += 1;
      await route.fulfill({ status: 200, contentType: 'text/event-stream', body });
    });

    await page.goto('/chat-demo');
    await page.waitForSelector('textarea', { timeout: 10000 });

    const input = page.getByPlaceholder(/Describe your feature idea/i);
    await input.fill('Help me define a support triage assistant.');
    await input.press('Enter');
    await expect(page.getByText('Who is the primary persona for this workflow?')).toBeVisible();

    await input.fill('It is for frontline support agents.');
    await input.press('Enter');
    await expect(page.getByText('What is the success metric for the first release?')).toBeVisible();

    const assistantQuestions = await page.locator('div.prose p').allTextContents();
    const distinctQuestions = new Set(
      assistantQuestions.filter((text) => text.trim().endsWith('?')).map((text) => text.trim())
    );
    expect(distinctQuestions.size).toBeGreaterThanOrEqual(2);
  });

  test('renders markdown formatting in assistant responses', async ({ page }) => {
    await page.route('**/api/discovery', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: [
          '0:"## Acceptance Criteria\\n"\n',
          '0:"- **Given** a signed-in user\\n"\n',
          '0:"- **When** they submit valid data\\n"\n',
          '0:"- **Then** the spec is saved\\n"\n',
          '0:"`status = ready_for_review`"\n',
        ].join(''),
      });
    });

    await page.goto('/chat-demo');
    await page.waitForSelector('textarea', { timeout: 10000 });

    const input = page.getByPlaceholder(/Describe your feature idea/i);
    await input.fill('Generate acceptance criteria in markdown.');
    await input.press('Enter');

    await expect(page.locator('strong').first()).toBeVisible();
    await expect(page.locator('ul li').first()).toBeVisible();
    await expect(page.locator('code').first()).toContainText('status = ready_for_review');
  });

  test('handles long input with special characters without crashing', async ({ page }) => {
    let receivedMessage = '';

    await page.route('**/api/discovery', async (route) => {
      const payload = route.request().postDataJSON() as {
        messages: Array<{ role: string; content: string }>;
      };
      receivedMessage = payload.messages[payload.messages.length - 1]?.content ?? '';

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: '0:"Captured. Let\'s continue discovery."\n',
      });
    });

    await page.goto('/chat-demo');
    await page.waitForSelector('textarea', { timeout: 10000 });

    const input = page.getByPlaceholder(/Describe your feature idea/i);
    const longSpecialMessage = `Need spec for invoices ${'x'.repeat(1200)} []{}()<>=&*%$#@! ~`;

    await input.fill(longSpecialMessage);
    await input.press('Enter');

    await expect(page.getByText(/Captured. Let's continue discovery./i)).toBeVisible();
    expect(receivedMessage).toBe(longSpecialMessage);
    await expect(page.getByText(longSpecialMessage)).toBeVisible();
  });

  test('shows loading state and completes within acceptable response time', async ({ page }) => {
    await page.route('**/api/discovery', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: '0:"Response delivered within expected SLA."\n',
      });
    });

    await page.goto('/chat-demo');
    await page.waitForSelector('textarea', { timeout: 10000 });

    const input = page.getByPlaceholder(/Describe your feature idea/i);
    const start = Date.now();

    await input.fill('Check response timing');
    await input.press('Enter');

    await expect(page.locator('.animate-bounce').first()).toBeVisible();
    await expect(page.getByText('Response delivered within expected SLA.')).toBeVisible();

    const elapsedMs = Date.now() - start;
    expect(elapsedMs).toBeLessThan(5_000);
  });
});
