import type { FeatureLifecycleStage } from '../value-objects/lifecycle-stage'
import { canTransitionFeature } from '../value-objects/lifecycle-stage'

export interface Feature {
  id: string
  workspaceId: string
  productId: string
  name: string
  description: string
  lifecycleStage: FeatureLifecycleStage
  sourceIdeaId: string
  parentFeatureId: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export function canTransition(
  feature: Feature,
  targetStage: FeatureLifecycleStage
): boolean {
  return canTransitionFeature(feature.lifecycleStage, targetStage)
}
