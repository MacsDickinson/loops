/**
 * Analytics Events for Discovery Loop Coach
 *
 * This file defines all trackable events and provides type-safe event tracking.
 * Events are organized by category matching PRD Section 8.
 */

export type AnalyticsEvent =
  // Activation Funnel
  | { event: 'user_signed_up'; properties?: { method?: string } }
  | { event: 'profile_completed'; properties?: Record<string, unknown> }
  | { event: 'first_spec_started'; properties?: { timeFromSignup?: number } }
  | { event: 'first_spec_completed'; properties?: { timeFromSignup?: number; dialogueTurns?: number } }
  | { event: 'first_spec_exported'; properties?: { format?: 'markdown' | 'github'; timeFromSignup?: number } }

  // Engagement
  | { event: 'spec_created'; properties?: { title?: string } }
  | { event: 'dialogue_turn_sent'; properties: { specId: string; personaType: string; questionLength?: number } }
  | { event: 'persona_activated'; properties: { personaType: 'product_agent' | 'security_expert' | 'ux_analyst' | 'domain_expert' } }
  | { event: 'spec_exported'; properties: { format: 'markdown' | 'github'; specId: string } }
  | { event: 'github_connected'; properties?: { success?: boolean } }
  | { event: 'pr_created'; properties: { specId: string; prUrl?: string } }

  // Feature Usage
  | { event: 'product_agent_used'; properties?: { specId?: string } }
  | { event: 'security_expert_used'; properties?: { specId?: string } }
  | { event: 'ux_analyst_used'; properties?: { specId?: string } }
  | { event: 'domain_expert_used'; properties?: { specId?: string } }
  | { event: 'markdown_export'; properties: { specId: string } }
  | { event: 'github_pr_creation'; properties: { specId: string } }

  // Performance
  | { event: 'dialogue_turn_latency'; properties: { latencyMs: number; specId: string } }
  | { event: 'spec_generation_time'; properties: { timeMs: number; specId: string } }
  | { event: 'api_error'; properties: { endpoint: string; errorType: string; statusCode?: number } }
  | { event: 'ai_token_usage'; properties: { specId: string; tokens: number; model?: string } }

  // Retention
  | { event: 'daily_active'; properties?: Record<string, unknown> }
  | { event: 'spec_creation_frequency'; properties: { daysSinceLastSpec?: number } }
  | { event: 'return_visit'; properties?: { daysSinceLastVisit?: number } }

export type EventName = AnalyticsEvent['event']
export type EventProperties<T extends EventName> = Extract<AnalyticsEvent, { event: T }>['properties']

/**
 * Event tracking utility for type-safe analytics
 */
export const analytics = {
  track<T extends EventName>(
    event: T,
    properties?: EventProperties<T>
  ) {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(event, properties as Record<string, unknown>)
    }
  },

  // Activation Funnel
  userSignedUp(method?: string) {
    this.track('user_signed_up', { method })
  },

  profileCompleted() {
    this.track('profile_completed')
  },

  firstSpecStarted(timeFromSignup?: number) {
    this.track('first_spec_started', { timeFromSignup })
  },

  firstSpecCompleted(timeFromSignup?: number, dialogueTurns?: number) {
    this.track('first_spec_completed', { timeFromSignup, dialogueTurns })
  },

  firstSpecExported(format: 'markdown' | 'github', timeFromSignup?: number) {
    this.track('first_spec_exported', { format, timeFromSignup })
  },

  // Engagement
  specCreated(title?: string) {
    this.track('spec_created', { title })
  },

  dialogueTurnSent(specId: string, personaType: string, questionLength?: number) {
    this.track('dialogue_turn_sent', { specId, personaType, questionLength })
  },

  personaActivated(personaType: 'product_agent' | 'security_expert' | 'ux_analyst' | 'domain_expert') {
    this.track('persona_activated', { personaType })
  },

  specExported(specId: string, format: 'markdown' | 'github') {
    this.track('spec_exported', { format, specId })
  },

  githubConnected(success?: boolean) {
    this.track('github_connected', { success })
  },

  prCreated(specId: string, prUrl?: string) {
    this.track('pr_created', { specId, prUrl })
  },

  // Performance
  dialogueTurnLatency(specId: string, latencyMs: number) {
    this.track('dialogue_turn_latency', { latencyMs, specId })
  },

  specGenerationTime(specId: string, timeMs: number) {
    this.track('spec_generation_time', { timeMs, specId })
  },

  apiError(endpoint: string, errorType: string, statusCode?: number) {
    this.track('api_error', { endpoint, errorType, statusCode })
  },

  aiTokenUsage(specId: string, tokens: number, model?: string) {
    this.track('ai_token_usage', { specId, tokens, model })
  },

  // Retention
  dailyActive() {
    this.track('daily_active')
  },

  specCreationFrequency(daysSinceLastSpec?: number) {
    this.track('spec_creation_frequency', { daysSinceLastSpec })
  },

  returnVisit(daysSinceLastVisit?: number) {
    this.track('return_visit', { daysSinceLastVisit })
  },
}

// Extend Window interface for PostHog
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void
      identify: (userId: string, properties?: Record<string, unknown>) => void
    }
  }
}
