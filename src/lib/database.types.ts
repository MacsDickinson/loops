/**
 * Database Types for Discovery Loop Coach
 *
 * Type-safe interfaces for Supabase database tables.
 * These types match the schema defined in supabase/migrations/20260307_initial_schema.sql
 */

// ============================================================================
// ENUMS
// ============================================================================

export type SubscriptionTier = 'free' | 'pro' | 'team'
export type SpecStatus = 'draft' | 'complete' | 'archived'
export type PersonaType = 'product_agent' | 'security_expert' | 'ux_analyst' | 'domain_expert'

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

export interface User {
  id: string
  clerk_user_id: string
  email: string
  name: string | null
  github_access_token: string | null
  linear_access_token: string | null
  subscription_tier: SubscriptionTier
  created_at: string
  updated_at: string
  last_active_at: string | null
}

export interface Specification {
  id: string
  user_id: string
  title: string
  description: string | null
  requirements_json: RequirementsJSON | null
  acceptance_tests_json: AcceptanceTest[] | null
  status: SpecStatus
  linked_github_pr: string | null
  linked_linear_issue: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  archived_at: string | null
}

export interface DialogueTurn {
  id: string
  spec_id: string
  persona_type: PersonaType
  question: string
  answer: string
  turn_order: number
  tokens_used: number | null
  latency_ms: number | null
  created_at: string
}

export interface PromptTemplate {
  id: string
  persona_type: PersonaType
  version: string
  system_prompt: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SpecAnalytics {
  id: string
  spec_id: string
  time_to_complete_sec: number | null
  dialogue_turns: number
  ai_tokens_used: number
  user_satisfaction_score: number | null
  created_at: string
}

export interface UserRateLimit {
  id: string
  user_id: string
  endpoint: string
  request_count: number
  window_start: string
  created_at: string
  updated_at: string
}

// ============================================================================
// JSON SCHEMAS
// ============================================================================

export interface Requirement {
  id: string
  category: string // e.g., "Functional", "Security", "Performance"
  description: string
  priority: 'must-have' | 'should-have' | 'nice-to-have'
  acceptance_criteria?: string[]
}

export interface RequirementsJSON {
  functional: Requirement[]
  security: Requirement[]
  performance: Requirement[]
  ux: Requirement[]
  other: Requirement[]
}

export interface AcceptanceTest {
  scenario: string
  given: string
  when: string
  then: string
  requirement_ids?: string[] // Links back to requirements
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_active_at'>

export type SpecificationInsert = Omit<
  Specification,
  'id' | 'created_at' | 'updated_at' | 'completed_at' | 'archived_at'
>

export type DialogueTurnInsert = Omit<DialogueTurn, 'id' | 'created_at'>

export type PromptTemplateInsert = Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>

export type SpecAnalyticsInsert = Omit<SpecAnalytics, 'id' | 'created_at'>

export type UserRateLimitInsert = Omit<UserRateLimit, 'id' | 'created_at' | 'updated_at'>

// ============================================================================
// UPDATE TYPES (for updating existing records)
// ============================================================================

export type UserUpdate = Partial<Omit<User, 'id' | 'clerk_user_id' | 'created_at' | 'updated_at'>>

export type SpecificationUpdate = Partial<
  Omit<Specification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>

export type DialogueTurnUpdate = Partial<Omit<DialogueTurn, 'id' | 'spec_id' | 'created_at'>>

export type PromptTemplateUpdate = Partial<
  Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>
>

export type UserRateLimitUpdate = Partial<
  Omit<UserRateLimit, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>

// ============================================================================
// QUERY RESULT TYPES (with joins)
// ============================================================================

export interface SpecificationWithUser extends Specification {
  user: User
}

export interface SpecificationWithAnalytics extends Specification {
  analytics: SpecAnalytics | null
}

export interface SpecificationFull extends Specification {
  user: User
  dialogue_turns: DialogueTurn[]
  analytics: SpecAnalytics | null
}

export interface DialogueTurnWithSpec extends DialogueTurn {
  specification: Specification
}

// ============================================================================
// DATABASE INTERFACE (Supabase client types)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      specifications: {
        Row: Specification
        Insert: SpecificationInsert
        Update: SpecificationUpdate
      }
      dialogue_turns: {
        Row: DialogueTurn
        Insert: DialogueTurnInsert
        Update: DialogueTurnUpdate
      }
      prompt_templates: {
        Row: PromptTemplate
        Insert: PromptTemplateInsert
        Update: PromptTemplateUpdate
      }
      spec_analytics: {
        Row: SpecAnalytics
        Insert: SpecAnalyticsInsert
        Update: never // Analytics should not be updated, only inserted
      }
      user_rate_limits: {
        Row: UserRateLimit
        Insert: UserRateLimitInsert
        Update: UserRateLimitUpdate
      }
    }
    Functions: {
      get_or_create_user: {
        Args: {
          p_clerk_user_id: string
          p_email: string
          p_name: string
        }
        Returns: string // user_id
      }
      get_active_prompt: {
        Args: {
          p_persona_type: PersonaType
        }
        Returns: string // system_prompt
      }
    }
  }
}
