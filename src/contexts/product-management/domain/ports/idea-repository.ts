import type { Idea } from '../entities/idea'

export interface PaginatedResult<T> {
  items: T[]
  total: number
}

export interface PaginationOptions {
  limit: number
  offset: number
}

export interface IIdeaRepository {
  findById(id: string): Promise<Idea | null>
  findByWorkspace(workspaceId: string): Promise<Idea[]>
  findInbox(workspaceId: string): Promise<Idea[]>
  findInboxPaginated(workspaceId: string, options: PaginationOptions): Promise<PaginatedResult<Idea>>
  findByProduct(productId: string): Promise<Idea[]>
  create(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'graduatedFeatureId'>): Promise<Idea>
  update(id: string, data: Partial<Pick<Idea, 'name' | 'description' | 'productId'>>): Promise<Idea>
}
