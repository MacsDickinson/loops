import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  lifecycleStage: z
    .enum(['idea', 'pilot', 'incubating', 'graduating', 'growth', 'sunset'])
    .default('idea'),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  lifecycleStage: z
    .enum(['idea', 'pilot', 'incubating', 'graduating', 'growth', 'sunset'])
    .optional(),
})

export const createIdeaSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).default(''),
  productId: z.string().uuid().nullable().default(null),
})

export const updateIdeaSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  productId: z.string().uuid().nullable().optional(),
})

export const graduateIdeaSchema = z.object({
  productId: z.string().uuid(),
})

export const transitionFeatureSchema = z.object({
  targetStage: z.enum(['pilot', 'incubating', 'graduating', 'growth', 'sunset']),
})

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
})
