/**
 * Zod Schemas for Discovery Loop Coach
 *
 * These schemas provide runtime validation and TypeScript type inference
 * for all data structures in the application. Used with Vercel AI SDK
 * structured output and API input validation.
 *
 * @see docs/product/discovery-loop-coach-prd.md Section 3 (Data Model)
 */

import { z } from 'zod';

// ============================================================================
// Enums and Constants
// ============================================================================

/**
 * Subscription tier levels
 */
export const SubscriptionTierSchema = z.enum(['free', 'pro', 'team']);
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>;

/**
 * Specification status values
 */
export const SpecificationStatusSchema = z.enum([
  'draft',
  'complete',
  'archived',
]);
export type SpecificationStatus = z.infer<typeof SpecificationStatusSchema>;

/**
 * AI persona types for multi-persona dialogue
 */
export const PersonaTypeSchema = z.enum([
  'product_coach',
  'security_expert',
  'ux_analyst',
  'domain_expert',
]);
export type PersonaType = z.infer<typeof PersonaTypeSchema>;

/**
 * Requirement priority levels
 */
export const RequirementPrioritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
]);
export type RequirementPriority = z.infer<typeof RequirementPrioritySchema>;

/**
 * Requirement categories for organization
 */
export const RequirementCategorySchema = z.enum([
  'functional',
  'non_functional',
  'security',
  'performance',
  'ux',
  'business_rule',
]);
export type RequirementCategory = z.infer<typeof RequirementCategorySchema>;

// ============================================================================
// Core Domain Schemas
// ============================================================================

/**
 * Acceptance Test Schema (BDD Format)
 *
 * Represents a single acceptance test in Gherkin/BDD format.
 * Maps to specific requirements for traceability.
 *
 * @example
 * ```typescript
 * const test: AcceptanceTest = {
 *   id: "test-1",
 *   scenario: "User logs in with valid credentials",
 *   given: "the user is on the login page",
 *   when: "they enter valid email and password",
 *   then: "they are redirected to the dashboard",
 *   linkedRequirementIds: ["req-1"],
 * };
 * ```
 */
export const AcceptanceTestSchema = z.object({
  id: z.string().uuid(),
  scenario: z.string().min(1).max(500),
  given: z.string().min(1).max(1000),
  when: z.string().min(1).max(1000),
  then: z.string().min(1).max(1000),
  linkedRequirementIds: z.array(z.string().uuid()).default([]),
  createdAt: z.date().optional(),
});
export type AcceptanceTest = z.infer<typeof AcceptanceTestSchema>;

/**
 * Requirement Schema
 *
 * Represents a single requirement extracted from the specification dialogue.
 * Links to acceptance tests for traceability.
 */
export const RequirementSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(2000),
  category: RequirementCategorySchema,
  priority: RequirementPrioritySchema,
  linkedTestIds: z.array(z.string().uuid()).default([]),
  createdAt: z.date().optional(),
});
export type Requirement = z.infer<typeof RequirementSchema>;

/**
 * Dialogue Turn Schema
 *
 * Represents a single turn in the discovery dialogue.
 * Includes the persona type, question asked, and user's answer.
 * Order field enables dialogue replay.
 */
export const DialogueTurnSchema = z.object({
  id: z.string().uuid(),
  specId: z.string().uuid(),
  personaType: PersonaTypeSchema,
  question: z.string().min(1).max(2000),
  answer: z.string().min(1).max(5000),
  order: z.number().int().min(0),
  timestamp: z.date(),
});
export type DialogueTurn = z.infer<typeof DialogueTurnSchema>;

/**
 * Specification Metadata
 *
 * Additional metadata about the specification creation process.
 */
export const SpecificationMetadataSchema = z.object({
  dialogueTurnCount: z.number().int().min(0).default(0),
  timeToCompleteSec: z.number().int().min(0).optional(),
  personasUsed: z.array(PersonaTypeSchema).default([]),
  aiTokensUsed: z.number().int().min(0).optional(),
});
export type SpecificationMetadata = z.infer<typeof SpecificationMetadataSchema>;

/**
 * Specification Schema
 *
 * Main schema for a complete specification created through the discovery dialogue.
 * Contains requirements, acceptance tests, and metadata.
 *
 * @example
 * ```typescript
 * const spec: Specification = {
 *   id: "spec-123",
 *   userId: "user-456",
 *   title: "User Authentication Flow",
 *   description: "Implement SSO login with Google and Microsoft",
 *   requirements: [...],
 *   acceptanceTests: [...],
 *   status: "complete",
 *   metadata: {
 *     dialogueTurnCount: 12,
 *     personasUsed: ["product_coach", "security_expert"],
 *   },
 * };
 * ```
 */
export const SpecificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  requirements: z.array(RequirementSchema).default([]),
  acceptanceTests: z.array(AcceptanceTestSchema).default([]),
  status: SpecificationStatusSchema,
  metadata: SpecificationMetadataSchema.optional(),
  linkedGithubPR: z.string().url().optional(),
  linkedLinearIssue: z.string().url().optional(),
  linkedJiraIssue: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
});
export type Specification = z.infer<typeof SpecificationSchema>;

/**
 * Persona Configuration Schema
 *
 * Defines the configuration for an AI persona used in the dialogue.
 * Supports A/B testing with versioning and activation flags.
 */
export const PersonaConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: PersonaTypeSchema,
  systemPrompt: z.string().min(1).max(10000),
  version: z.number().int().min(1).default(1),
  isActive: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type PersonaConfig = z.infer<typeof PersonaConfigSchema>;

// ============================================================================
// User and Authentication Schemas
// ============================================================================

/**
 * User Schema
 *
 * Represents a user in the system with authentication tokens
 * and subscription information.
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  githubAccessToken: z.string().optional(),
  linearAccessToken: z.string().optional(),
  jiraAccessToken: z.string().optional(),
  subscriptionTier: SubscriptionTierSchema.default('free'),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

// ============================================================================
// Analytics and Monitoring Schemas
// ============================================================================

/**
 * Specification Analytics Schema
 *
 * Captures metrics about specification creation for product analytics.
 */
export const SpecAnalyticsSchema = z.object({
  id: z.string().uuid(),
  specId: z.string().uuid(),
  timeToCompleteSec: z.number().int().min(0),
  dialogueTurns: z.number().int().min(0),
  aiTokensUsed: z.number().int().min(0),
  userSatisfactionScore: z.number().int().min(1).max(5).optional(),
  createdAt: z.date(),
});
export type SpecAnalytics = z.infer<typeof SpecAnalyticsSchema>;

/**
 * Rate Limit Entry Schema
 *
 * Tracks API rate limiting per user and endpoint.
 */
export const RateLimitEntrySchema = z.object({
  userId: z.string().uuid(),
  endpoint: z.string().min(1).max(200),
  requestCount: z.number().int().min(0),
  windowStart: z.date(),
});
export type RateLimitEntry = z.infer<typeof RateLimitEntrySchema>;

// ============================================================================
// API Request/Response Schemas
// ============================================================================

/**
 * Create Specification Request
 *
 * Payload for creating a new specification.
 */
export const CreateSpecificationRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
});
export type CreateSpecificationRequest = z.infer<
  typeof CreateSpecificationRequestSchema
>;

/**
 * Update Specification Request
 *
 * Payload for updating an existing specification.
 */
export const UpdateSpecificationRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  status: SpecificationStatusSchema.optional(),
  requirements: z.array(RequirementSchema).optional(),
  acceptanceTests: z.array(AcceptanceTestSchema).optional(),
});
export type UpdateSpecificationRequest = z.infer<
  typeof UpdateSpecificationRequestSchema
>;

/**
 * Dialogue Turn Request
 *
 * Payload for submitting a dialogue turn (user's answer to AI question).
 */
export const DialogueTurnRequestSchema = z.object({
  specId: z.string().uuid(),
  personaType: PersonaTypeSchema,
  answer: z.string().min(1).max(5000),
});
export type DialogueTurnRequest = z.infer<typeof DialogueTurnRequestSchema>;

/**
 * Dialogue Turn Response
 *
 * Response from AI containing the next question or completion signal.
 */
export const DialogueTurnResponseSchema = z.object({
  question: z.string().optional(),
  isComplete: z.boolean(),
  updatedRequirements: z.array(RequirementSchema).optional(),
  updatedTests: z.array(AcceptanceTestSchema).optional(),
});
export type DialogueTurnResponse = z.infer<typeof DialogueTurnResponseSchema>;

/**
 * Export Specification Request
 *
 * Options for exporting a specification to various formats.
 */
export const ExportSpecificationRequestSchema = z.object({
  specId: z.string().uuid(),
  format: z.enum(['markdown', 'gherkin', 'json']),
  includeMetadata: z.boolean().default(false),
});
export type ExportSpecificationRequest = z.infer<
  typeof ExportSpecificationRequestSchema
>;

/**
 * GitHub Integration Request
 *
 * Payload for creating a GitHub PR or issue from a specification.
 */
export const GitHubIntegrationRequestSchema = z.object({
  specId: z.string().uuid(),
  repoOwner: z.string().min(1),
  repoName: z.string().min(1),
  branch: z.string().min(1).default('main'),
  type: z.enum(['pr', 'issue']),
  title: z.string().min(1).max(200).optional(),
});
export type GitHubIntegrationRequest = z.infer<
  typeof GitHubIntegrationRequestSchema
>;

// ============================================================================
// Structured AI Output Schemas
// ============================================================================

/**
 * AI Generated Requirements Output
 *
 * Schema for structured output from AI when generating requirements.
 * Used with Vercel AI SDK structured output.
 */
export const AIGeneratedRequirementsSchema = z.object({
  requirements: z.array(
    z.object({
      text: z.string(),
      category: RequirementCategorySchema,
      priority: RequirementPrioritySchema,
    })
  ),
  reasoning: z.string().optional(),
});
export type AIGeneratedRequirements = z.infer<
  typeof AIGeneratedRequirementsSchema
>;

/**
 * AI Generated Tests Output
 *
 * Schema for structured output from AI when generating acceptance tests.
 */
export const AIGeneratedTestsSchema = z.object({
  tests: z.array(
    z.object({
      scenario: z.string(),
      given: z.string(),
      when: z.string(),
      then: z.string(),
    })
  ),
  reasoning: z.string().optional(),
});
export type AIGeneratedTests = z.infer<typeof AIGeneratedTestsSchema>;

/**
 * AI Spec Extraction Output
 *
 * Used for incremental extraction of requirements and tests
 * from a single dialogue turn. Also extracts idea title/description
 * when not yet set.
 */
export const AISpecExtractionSchema = z.object({
  hasChanges: z.boolean(),
  ideaTitle: z.string().optional(),
  ideaDescription: z.string().optional(),
  prdMarkdown: z.string().describe(
    'The full PRD document in markdown format. Build incrementally — preserve existing sections, add new ones, and refine based on the latest conversation turn. Sections typically include: Overview, User Stories, User Journey, Business Rules, Security Considerations, Performance Requirements, Out of Scope, Open Questions.'
  ),
  acceptanceTests: z.array(
    z.object({
      scenario: z.string(),
      given: z.string(),
      when: z.string(),
      then: z.string(),
    })
  ),
});
export type AISpecExtraction = z.infer<typeof AISpecExtractionSchema>;

/**
 * AI Clarifying Question Output
 *
 * Schema for AI-generated clarifying questions during dialogue.
 */
export const AIClarifyingQuestionSchema = z.object({
  question: z.string(),
  personaType: PersonaTypeSchema,
  reasoning: z.string().optional(),
  suggestedAnswers: z.array(z.string()).optional(),
});
export type AIClarifyingQuestion = z.infer<typeof AIClarifyingQuestionSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates and parses data against a schema, returning typed result or null.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed data if valid, null if invalid
 *
 * @example
 * ```typescript
 * const spec = safeValidate(SpecificationSchema, unknownData);
 * if (spec) {
 *   // spec is type-safe Specification
 *   console.log(spec.title);
 * }
 * ```
 */
export function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validates data against a schema, throwing an error if invalid.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed, typed data
 * @throws {z.ZodError} If validation fails
 */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}
