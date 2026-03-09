import type { IFeatureRepository } from '../domain/ports/feature-repository'
import type { Feature } from '../domain/entities/feature'
import type { FeatureLifecycleStage } from '../domain/value-objects/lifecycle-stage'
import { canTransitionFeature } from '../domain/value-objects/lifecycle-stage'

interface TransitionInput {
  featureId: string
  targetStage: FeatureLifecycleStage
}

export class TransitionFeatureLifecycle {
  constructor(private featureRepo: IFeatureRepository) {}

  async execute(input: TransitionInput): Promise<Feature> {
    const feature = await this.featureRepo.findById(input.featureId)
    if (!feature) {
      throw new Error(`Feature not found: ${input.featureId}`)
    }

    if (!canTransitionFeature(feature.lifecycleStage, input.targetStage)) {
      throw new Error(
        `Cannot transition from ${feature.lifecycleStage} to ${input.targetStage}`
      )
    }

    return this.featureRepo.updateLifecycleStage(input.featureId, input.targetStage)
  }
}
