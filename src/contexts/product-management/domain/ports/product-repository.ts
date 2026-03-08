import type { Product } from '../entities/product'

export interface IProductRepository {
  findById(id: string): Promise<Product | null>
  findByWorkspace(workspaceId: string): Promise<Product[]>
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>
  update(id: string, data: Partial<Pick<Product, 'name' | 'description' | 'lifecycleStage'>>): Promise<Product>
}
