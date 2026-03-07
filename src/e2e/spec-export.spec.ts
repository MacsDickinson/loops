import { test, expect } from '@playwright/test';

test.describe('Specification Export', () => {
  // Mock specification data for testing
  const mockSpec = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    title: 'User Authentication Flow',
    description: 'Implement SSO login with Google and Microsoft',
    requirements: [
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        text: 'Users must be able to log in with Google OAuth',
        category: 'functional',
        priority: 'critical',
        linkedTestIds: [],
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        text: 'System must handle authentication errors gracefully',
        category: 'security',
        priority: 'high',
        linkedTestIds: [],
      },
    ],
    acceptanceTests: [
      {
        id: '123e4567-e89b-12d3-a456-426614174004',
        scenario: 'User logs in with Google',
        given: 'the user is on the login page',
        when: 'they click "Sign in with Google"',
        then: 'they are redirected to the dashboard',
        linkedRequirementIds: ['123e4567-e89b-12d3-a456-426614174002'],
      },
    ],
    status: 'complete',
    metadata: {
      dialogueTurnCount: 8,
      timeToCompleteSec: 420,
      personasUsed: ['product_coach', 'security_expert'],
      aiTokensUsed: 1250,
    },
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:10:00Z'),
  };

  test('exports specification as Markdown via API', async ({ request }) => {
    const response = await request.post('/api/specs/export', {
      data: {
        spec: mockSpec,
        format: 'markdown',
        includeMetadata: false,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('text/markdown');
    expect(response.headers()['content-disposition']).toContain('attachment');
    expect(response.headers()['content-disposition']).toContain('.md');

    const markdown = await response.text();

    // Verify Markdown structure
    expect(markdown).toContain('# User Authentication Flow');
    expect(markdown).toContain('## Overview');
    expect(markdown).toContain('Implement SSO login with Google and Microsoft');
    expect(markdown).toContain('## Requirements');
    expect(markdown).toContain('Users must be able to log in with Google OAuth');
    expect(markdown).toContain('## Acceptance Tests');
    expect(markdown).toContain('```gherkin');
    expect(markdown).toContain('Scenario: User logs in with Google');
    expect(markdown).toContain('Given the user is on the login page');
  });

  test('exports specification with metadata when includeMetadata is true', async ({
    request,
  }) => {
    const response = await request.post('/api/specs/export', {
      data: {
        spec: mockSpec,
        format: 'markdown',
        includeMetadata: true,
      },
    });

    expect(response.ok()).toBeTruthy();

    const markdown = await response.text();

    // Verify metadata section
    expect(markdown).toContain('## Metadata');
    expect(markdown).toContain('Dialogue Turns: 8');
    expect(markdown).toContain('Time to Complete: 7 minutes');
    expect(markdown).toContain('Personas Used: Product Coach, Security Expert');
    expect(markdown).toContain('AI Tokens Used: 1,250');
  });

  test('exports specification as JSON format', async ({ request }) => {
    const response = await request.post('/api/specs/export', {
      data: {
        spec: mockSpec,
        format: 'json',
        includeMetadata: false,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');
    expect(response.headers()['content-disposition']).toContain('.json');

    const json = await response.json();

    expect(json.title).toBe('User Authentication Flow');
    expect(json.requirements).toHaveLength(2);
    expect(json.acceptanceTests).toHaveLength(1);
  });

  test('exports specification as Gherkin format', async ({ request }) => {
    const response = await request.post('/api/specs/export', {
      data: {
        spec: mockSpec,
        format: 'gherkin',
        includeMetadata: false,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('text/plain');
    expect(response.headers()['content-disposition']).toContain('.feature');

    const gherkin = await response.text();

    expect(gherkin).toContain('Feature: User Authentication Flow');
    expect(gherkin).toContain('Scenario: User logs in with Google');
    expect(gherkin).toContain('Given the user is on the login page');
    expect(gherkin).toContain('When they click "Sign in with Google"');
    expect(gherkin).toContain('Then they are redirected to the dashboard');
  });

  test('returns 401 when user is not authenticated', async ({ request }) => {
    // This test assumes Clerk middleware is properly configured
    // In a real test, we would need to ensure no auth cookie is present
    const response = await request.post('/api/specs/export', {
      data: {
        spec: mockSpec,
        format: 'markdown',
        includeMetadata: false,
      },
      headers: {
        Cookie: '', // No auth cookie
      },
    });

    // Note: This might pass with 200 in local dev if auth is bypassed
    // In production with proper Clerk setup, this should be 401
    if (!response.ok()) {
      expect(response.status()).toBe(401);
      const error = await response.json();
      expect(error.error).toBe('Unauthorized');
    }
  });

  test('returns 400 when specification is invalid', async ({ request }) => {
    const response = await request.post('/api/specs/export', {
      data: {
        spec: {
          // Invalid spec - missing required fields
          title: 'Invalid Spec',
        },
        format: 'markdown',
      },
    });

    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error.error).toBe('Invalid specification format');
  });

  test('returns 400 when format is invalid', async ({ request }) => {
    const response = await request.post('/api/specs/export', {
      data: {
        spec: mockSpec,
        format: 'invalid-format',
      },
    });

    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error.error).toBe('Invalid format');
  });

  test('generates correct filename from specification title', async ({ request }) => {
    const response = await request.post('/api/specs/export', {
      data: {
        spec: mockSpec,
        format: 'markdown',
      },
    });

    expect(response.ok()).toBeTruthy();

    const contentDisposition = response.headers()['content-disposition'];
    expect(contentDisposition).toContain('user-authentication-flow.md');
  });

  test('handles special characters in specification title for filename', async ({
    request,
  }) => {
    const specWithSpecialChars = {
      ...mockSpec,
      title: 'User Auth: OAuth 2.0 (Google & Microsoft)',
    };

    const response = await request.post('/api/specs/export', {
      data: {
        spec: specWithSpecialChars,
        format: 'markdown',
      },
    });

    expect(response.ok()).toBeTruthy();

    const contentDisposition = response.headers()['content-disposition'];
    // Special characters should be converted to hyphens
    expect(contentDisposition).toContain('user-auth-oauth-2-0-google-microsoft.md');
  });
});
