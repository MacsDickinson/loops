# Analytics Implementation - PostHog

This directory contains the PostHog analytics implementation for Discovery Loop Coach, tracking all key metrics defined in PRD Section 8.

## Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Get your PostHog API key from:
1. Sign up at https://posthog.com
2. Create project: "Discovery Loop Coach"
3. Copy Project API Key from Settings

### 2. Provider Integration

The PostHog provider is already integrated in `app/layout.tsx`:
- Initializes PostHog on app load
- Identifies users via Clerk authentication
- Tracks page views automatically

## Usage

### Client-Side Events

Use the type-safe `analytics` utility:

```typescript
import { analytics } from '@/lib/analytics/events'

// Activation funnel
analytics.userSignedUp('google')
analytics.firstSpecStarted(120) // 120 seconds from signup

// Engagement
analytics.specCreated('My Product Spec')
analytics.dialogueTurnSent('spec-123', 'product_coach', 50)
analytics.personaActivated('security_expert')

// Performance
analytics.dialogueTurnLatency('spec-123', 1250) // 1.25 seconds
analytics.aiTokenUsage('spec-123', 450, 'claude-sonnet-4.5')
```

### Server-Side Events

Use the server utility for API routes:

```typescript
import { trackServerEvent } from '@/lib/analytics/posthog-server'

export async function POST(req: Request) {
  const userId = await getUserId(req)

  await trackServerEvent('api_called', {
    endpoint: '/api/discovery',
    duration: 1500,
  }, userId)
}
```

## Event Categories

### Activation Funnel
Tracks user journey from signup to first value:
- `user_signed_up` - User creates account
- `profile_completed` - User completes profile
- `first_spec_started` - User starts first specification
- `first_spec_completed` - User completes first spec
- `first_spec_exported` - User exports first spec

**Key Metric:** Time from signup to first spec completion

### Engagement
Tracks core product interactions:
- `spec_created` - New specification started
- `dialogue_turn_sent` - User asks a question to AI persona
- `persona_activated` - User switches to a different persona
- `spec_exported` - User exports spec (markdown/GitHub)
- `github_connected` - User connects GitHub account
- `pr_created` - User creates GitHub PR from spec

**Key Metrics:**
- Specs created per user
- Dialogue turns per spec
- Persona usage distribution

### Feature Usage
Tracks which personas are most valuable:
- `product_coach_used`
- `security_expert_used`
- `ux_analyst_used`
- `domain_expert_used`

**Key Metric:** Persona usage distribution

### Performance
Tracks system performance and reliability:
- `dialogue_turn_latency` - Time to get AI response
- `spec_generation_time` - Time to complete full spec
- `api_error` - API failures and errors
- `ai_token_usage` - AI token consumption

**Key Metrics:**
- p50/p95 latency for dialogue turns
- Error rate by endpoint
- Token usage per spec

### Retention
Tracks long-term engagement:
- `daily_active` - User active on a given day
- `spec_creation_frequency` - Days between specs
- `return_visit` - User returns after period of inactivity

**Key Metrics:**
- DAU/WAU (Daily/Weekly Active Users)
- Return visit rate

## Type Safety

All events are type-safe via TypeScript:

```typescript
// ✅ Type-safe - autocomplete works
analytics.dialogueTurnSent('spec-123', 'product_coach', 50)

// ❌ Type error - invalid persona type
analytics.dialogueTurnSent('spec-123', 'invalid_persona', 50)
```

## GDPR Compliance

PostHog is GDPR-compliant by default:

1. **User Identification**: Only identified users (logged in via Clerk) have events tracked with their user ID
2. **Data Collection**: No PII is collected beyond email (required for product functionality)
3. **User Control**: Users can request data deletion via PostHog's data deletion API
4. **Cookie Consent**: PostHog respects Do Not Track (DNT) browser settings
5. **Data Location**: Use EU cloud (`NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`) for EU users

### Implementation Notes

- PostHog stores events with `person_profiles: 'identified_only'` (no anonymous tracking)
- Page views are captured manually for better control
- Debug mode enabled in development only
- No sensitive data (passwords, tokens) is ever tracked

## Dashboard Setup

### Key Metrics Dashboard

Create the following insights in PostHog:

1. **Activation Funnel**
   - Filter: `user_signed_up` → `first_spec_completed`
   - Metric: Conversion rate, time to convert

2. **Engagement**
   - Graph: `spec_created` over time (daily/weekly)
   - Breakdown: By user cohort

3. **Persona Usage**
   - Pie chart: `persona_activated` events
   - Breakdown: By `personaType` property

4. **Performance**
   - Line graph: `dialogue_turn_latency` p50/p95
   - Alert: When p95 > 3000ms

5. **Retention**
   - Cohort retention: Users who created first spec
   - Metric: % who create 2nd spec within 7 days

### Recommended Actions

Set up PostHog Actions for key behaviors:
- "Power User" = User who created 5+ specs
- "Engaged" = User who used 3+ different personas
- "At Risk" = User who hasn't created spec in 14 days

## Testing

### Local Development

PostHog debug mode is enabled in development:

```bash
npm run dev
# Open browser console to see PostHog events
```

### Event Verification

1. Check browser console for PostHog debug logs
2. Verify events in PostHog Activity tab (real-time)
3. Check "Live Events" in PostHog dashboard

## Files

- `posthog-provider.tsx` - React provider and user identification
- `events.ts` - Type-safe event definitions and tracking utilities
- `posthog-server.ts` - Server-side event tracking
- `page-tracking.tsx` - Automatic page view tracking
- `README.md` - This file

## Best Practices

1. **Always use the analytics utility** - Don't call PostHog directly
2. **Track user intent, not just clicks** - Track "user started spec" not "button clicked"
3. **Include context** - Add properties like `specId`, `personaType` for filtering
4. **Performance tracking** - Always include latency for async operations
5. **Error tracking** - Track all API errors with context
6. **Test locally** - Use debug mode to verify events before shipping

## References

- PRD Section 8: Success Metrics
- PostHog Docs: https://posthog.com/docs
- GDPR Guide: https://posthog.com/docs/privacy/gdpr-compliance
