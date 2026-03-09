import type { Feature } from '../entities/feature'
import type { FeatureLifecycleStage } from '../value-objects/lifecycle-stage'

export interface IFeatureRepository {
  findById(id: string): Promise<Feature | null>
  findByProduct(productId: string): Promise<Feature[]>
  findByWorkspace(workspaceId: string): Promise<Feature[]>
  update(id: string, data: Partial<Pick<Feature, 'name' | 'description' | 'lifecycleStage'>>): Promise<Feature>
  updateLifecycleStage(id: string, stage: FeatureLifecycleStage): Promise<Feature>
}
