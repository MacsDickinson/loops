# Analytics Events Schema

**Version:** 1.0
**Last Updated:** 2026-03-07
**Implementation:** MAC-38 (Founding Engineer)
**Owner:** PM

## Overview

Event tracking schema for Discovery Loop Coach beta launch. Designed to measure Product-Market Fit (PMF) signals and beta success metrics defined in MAC-50 roadmap.

**Analytics Platform:** PostHog
**Integration:** Vercel Analytics (technical metrics)

## Beta Success Metrics (Target)

**Week 10 (Launch + 1 week):**
- **Activation:** 70% complete first spec within 24 hours
- **Quality:** Specs average >500 words with acceptance criteria
- **Engagement:** 50% day-2 return rate

**Week 11-12:**
- **Value:** 30%+ report reduced rework (survey)
- **Satisfaction:** Engineers rate specs 4+/5 for clarity (survey)
- **PMF Signal:** 40%+ "very disappointed" if product disappeared
- **Engagement:** 70% week-1 return rate

## Event Categories

### 1. User Lifecycle Events
### 2. Specification Events
### 3. Dialogue Events
### 4. Export & Integration Events
### 5. Engagement Events
### 6. Error & Performance Events

---

## 1. User Lifecycle Events

### `user_signed_up`

**When:** User completes registration

```typescript
{
  event: "user_signed_up",
  properties: {
    user_id: string,           // Unique user ID
    email: string,             // User email (hashed for privacy)
    auth_provider: "github" | "google" | "email",
    referral_source: string,   // UTM source if available
    timestamp: ISO8601,
    first_visit: boolean
  }
}
```

**Metric:** Total signups

---

### `user_logged_in`

**When:** User logs in (returning user)

```typescript
{
  event: "user_logged_in",
  properties: {
    user_id: string,
    session_id: string,
    days_since_signup: number,
    timestamp: ISO8601
  }
}
```

**Metric:** Return rate (day-2, week-1)

---

### `user_onboarding_started`

**When:** User begins onboarding flow

```typescript
{
  event: "user_onboarding_started",
  properties: {
    user_id: string,
    onboarding_version: string, // "v1.0"
    timestamp: ISO8601
  }
}
```

---

### `user_onboarding_completed`

**When:** User finishes onboarding tutorial

```typescript
{
  event: "user_onboarding_completed",
  properties: {
    user_id: string,
    time_to_complete_sec: number,
    steps_completed: number,
    steps_skipped: number,
    timestamp: ISO8601
  }
}
```

**Metric:** Onboarding completion rate

---

## 2. Specification Events

### `spec_created`

**When:** New spec is created

```typescript
{
  event: "spec_created",
  properties: {
    user_id: string,
    spec_id: string,
    spec_number: number,        // 1st spec, 2nd spec for user
    time_since_signup_sec: number,
    timestamp: ISO8601
  }
}
```

**Metric:** Activation (first spec within 24h)

---

### `spec_first_completed`

**When:** User completes their first spec

```typescript
{
  event: "spec_first_completed",
  properties: {
    user_id: string,
    spec_id: string,
    time_to_first_spec_sec: number,  // Time from signup
    dialogue_turns: number,
    requirements_count: number,
    acceptance_tests_count: number,
    spec_word_count: number,
    timestamp: ISO8601
  }
}
```

**Metric:** Activation, Time to value

---

### `spec_saved`

**When:** Spec is auto-saved or manually saved

```typescript
{
  event: "spec_saved",
  properties: {
    user_id: string,
    spec_id: string,
    save_trigger: "auto" | "manual" | "dialogue_turn",
    spec_status: "draft" | "in_progress" | "complete",
    dialogue_turns: number,
    requirements_count: number,
    acceptance_tests_count: number,
    spec_word_count: number,
    timestamp: ISO8601
  }
}
```

**Metric:** Spec quality (word count, acceptance criteria)

---

### `spec_completed`

**When:** User marks spec as complete

```typescript
{
  event: "spec_completed",
  properties: {
    user_id: string,
    spec_id: string,
    time_to_complete_sec: number,   // Time from creation
    dialogue_turns: number,
    requirements_count: number,
    acceptance_tests_count: number,
    personas_used: string[],        // ["Product Coach", "Security Expert"]
    spec_word_count: number,
    has_acceptance_criteria: boolean,
    timestamp: ISO8601
  }
}
```

**Metric:** Quality (>500 words, has acceptance criteria)

---

### `spec_exported`

**When:** User exports spec

```typescript
{
  event: "spec_exported",
  properties: {
    user_id: string,
    spec_id: string,
    export_format: "markdown" | "pdf" | "json",
    export_method: "clipboard" | "download" | "github_pr" | "linear_issue",
    timestamp: ISO8601
  }
}
```

**Metric:** Export method usage

---

### `spec_deleted`

**When:** User deletes a spec

```typescript
{
  event: "spec_deleted",
  properties: {
    user_id: string,
    spec_id: string,
    spec_status: "draft" | "complete",
    dialogue_turns: number,
    timestamp: ISO8601
  }
}
```

---

## 3. Dialogue Events

### `dialogue_started`

**When:** User starts a new dialogue for a spec

```typescript
{
  event: "dialogue_started",
  properties: {
    user_id: string,
    spec_id: string,
    persona: "Product Coach" | "Security Expert" | "UX Analyst",
    timestamp: ISO8601
  }
}
```

---

### `dialogue_turn_completed`

**When:** AI responds to user message

```typescript
{
  event: "dialogue_turn_completed",
  properties: {
    user_id: string,
    spec_id: string,
    turn_number: number,
    persona: string,
    user_message_length: number,
    ai_response_length: number,
    ai_response_time_ms: number,
    ai_first_token_time_ms: number,
    requirements_added: number,
    tests_added: number,
    timestamp: ISO8601
  }
}
```

**Metric:** Performance (response time, first token)

---

### `dialogue_persona_switched`

**When:** User switches AI persona mid-dialogue

```typescript
{
  event: "dialogue_persona_switched",
  properties: {
    user_id: string,
    spec_id: string,
    from_persona: string,
    to_persona: string,
    turn_number: number,
    timestamp: ISO8601
  }
}
```

**Metric:** Multi-persona feature usage

---

## 4. Export & Integration Events

### `github_oauth_connected`

**When:** User connects GitHub account

```typescript
{
  event: "github_oauth_connected",
  properties: {
    user_id: string,
    github_username: string,
    scopes_granted: string[],
    timestamp: ISO8601
  }
}
```

**Metric:** GitHub integration adoption

---

### `github_pr_created`

**When:** User creates PR from spec (v1.1 feature)

```typescript
{
  event: "github_pr_created",
  properties: {
    user_id: string,
    spec_id: string,
    repo_name: string,
    pr_url: string,
    timestamp: ISO8601
  }
}
```

---

### `linear_oauth_connected`

**When:** User connects Linear account

```typescript
{
  event: "linear_oauth_connected",
  properties: {
    user_id: string,
    linear_org: string,
    timestamp: ISO8601
  }
}
```

---

## 5. Engagement Events

### `dashboard_viewed`

**When:** User views spec dashboard

```typescript
{
  event: "dashboard_viewed",
  properties: {
    user_id: string,
    session_id: string,
    specs_count: number,
    timestamp: ISO8601
  }
}
```

---

### `spec_viewed`

**When:** User opens an existing spec

```typescript
{
  event: "spec_viewed",
  properties: {
    user_id: string,
    spec_id: string,
    spec_status: string,
    days_since_created: number,
    timestamp: ISO8601
  }
}
```

---

### `feature_discovery`

**When:** User discovers a new feature

```typescript
{
  event: "feature_discovery",
  properties: {
    user_id: string,
    feature_name: "multi_persona" | "export" | "github_integration" | "keyboard_shortcuts",
    discovery_method: "tooltip" | "help" | "onboarding" | "organic",
    timestamp: ISO8601
  }
}
```

---

## 6. Error & Performance Events

### `error_occurred`

**When:** User encounters an error

```typescript
{
  event: "error_occurred",
  properties: {
    user_id: string,
    error_type: "api" | "ui" | "auth" | "network",
    error_message: string,
    error_context: string,        // What user was doing
    spec_id?: string,              // If error was spec-related
    timestamp: ISO8601
  }
}
```

---

### `performance_metric`

**When:** Performance threshold exceeded

```typescript
{
  event: "performance_metric",
  properties: {
    user_id: string,
    metric_name: "dialogue_turn" | "spec_load" | "export",
    duration_ms: number,
    threshold_ms: number,          // Expected performance target
    exceeded: boolean,
    timestamp: ISO8601
  }
}
```

**Metric:** NFR compliance (dialogue <2s, first token <500ms)

---

## Metric Calculations

### Activation Rate

```typescript
// Users who complete first spec within 24 hours
const activationRate = (
  users_with_spec_first_completed_within_24h /
  total_signups
) * 100

// Target: 70%
```

### Day-2 Return Rate

```typescript
// Users who log in on day 2 after signup
const day2Return = (
  users_with_login_on_day_2 /
  users_signed_up_2_days_ago
) * 100

// Target: 50%
```

### Week-1 Return Rate

```typescript
// Users who log in within first week
const week1Return = (
  users_with_login_within_7_days /
  users_signed_up_7_days_ago
) * 100

// Target: 70%
```

### Spec Quality Score

```typescript
// Specs meeting quality criteria
const qualityScore = (
  specs_with_word_count_gt_500_and_acceptance_criteria /
  total_completed_specs
) * 100

// Target: Average >500 words with acceptance criteria
```

---

## PostHog Implementation

### Setup

1. Create PostHog account
2. Get project API key
3. Add PostHog SDK to Next.js app
4. Initialize with project key

### Code Example

```typescript
// lib/analytics.ts
import posthog from 'posthog-js'

export const analytics = {
  track: (event: string, properties: object) => {
    posthog.capture(event, properties)
  },

  identify: (userId: string, traits: object) => {
    posthog.identify(userId, traits)
  }
}

// Usage
import { analytics } from '@/lib/analytics'

analytics.track('spec_created', {
  user_id: user.id,
  spec_id: spec.id,
  spec_number: userSpecCount,
  time_since_signup_sec: timeSinceSignup,
  timestamp: new Date().toISOString()
})
```

---

## Privacy & Compliance

### Data Retention

- Event data: 1 year
- PII (emails): Hashed before storage
- User can request data deletion (GDPR)

### Opt-Out

- Users can opt out of analytics in settings
- Essential events (errors) still tracked for product quality
- Anonymize user_id for opted-out users

---

## Beta Analytics Dashboard

### Key Metrics to Monitor

**Week 10 Dashboard:**
1. Signups (daily)
2. Activation rate (first spec within 24h)
3. Spec quality (word count, acceptance criteria %)
4. Day-2 return rate
5. Errors (by type)

**Week 11-12 Dashboard:**
1. Week-1 return rate
2. Specs per active user
3. Export method distribution
4. Dialogue performance (avg response time)
5. Feature adoption (personas, integrations)

---

## Next Steps

**PM (Week 1):**
- [ ] Create PostHog account
- [ ] Share API key with Founding Engineer
- [ ] Define beta dashboard in PostHog

**Founding Engineer (Week 1-2):**
- [ ] Implement PostHog SDK (MAC-38)
- [ ] Add event tracking for all schema events
- [ ] Test events in dev environment
- [ ] Deploy to production

**Post-Launch (Week 10+):**
- [ ] Monitor dashboard daily
- [ ] Export metrics for CEO/stakeholders
- [ ] Identify drop-off points
- [ ] Iterate based on data

---

**Related Tasks:**
- MAC-38: Analytics implementation (Founding Engineer)
- MAC-50: Roadmap with beta success metrics
- MAC-67: Beta launch product validation (PM)

**Version History:**
- v1.0 (2026-03-07): Initial schema for beta launch
