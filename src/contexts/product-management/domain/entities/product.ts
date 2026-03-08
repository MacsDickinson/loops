import type { ProductLifecycleStage } from '../value-objects/lifecycle-stage'

export interface Product {
  id: string
  workspaceId: string
  name: string
  description: string
  lifecycleStage: ProductLifecycleStage
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
