import { z } from 'zod'

export const personaTypeSchema = z.enum([
  'product_coach',
  'security_expert',
  'ux_analyst',
  'domain_expert',
])

export const requirementPrioritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
])

export const requirementCategorySchema = z.enum([
  'functional',
  'non_functional',
  'security',
  'performance',
  'ux',
  'business_rule',
])

export const requirementSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(2000),
  category: requirementCategorySchema,
  priority: requirementPrioritySchema,
  linkedTestIds: z.array(z.string().uuid()).default([]),
})

export const acceptanceTestSchema = z.object({
  id: z.string().uuid(),
  scenario: z.string().min(1).max(500),
  given: z.string().min(1).max(1000),
  when: z.string().min(1).max(1000),
  then: z.string().min(1).max(1000),
  linkedRequirementIds: z.array(z.string().uuid()).default([]),
})

export const dialogueMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
})

export const conductDialogueSchema = z.object({
  messages: z.array(dialogueMessageSchema).min(1),
})

export const synthesizeSpecSchema = z.object({
  messages: z.array(dialogueMessageSchema).min(1),
})

export const updateSpecificationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['draft', 'complete', 'archived']).optional(),
  requirements: z.array(requirementSchema).optional(),
  acceptanceTests: z.array(acceptanceTestSchema).optional(),
})

export const aiGeneratedRequirementsSchema = z.object({
  requirements: z.array(
    z.object({
      text: z.string(),
      category: requirementCategorySchema,
      priority: requirementPrioritySchema,
    })
  ),
  reasoning: z.string().optional(),
})

export const aiGeneratedTestsSchema = z.object({
  tests: z.array(
    z.object({
      scenario: z.string(),
      given: z.string(),
      when: z.string(),
      then: z.string(),
    })
  ),
  reasoning: z.string().optional(),
})
