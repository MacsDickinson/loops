import type { SpecificationChange } from '../entities/specification-change'

export interface IChangelogRepository {
  findBySpec(specificationId: string): Promise<SpecificationChange[]>
  create(change: Omit<SpecificationChange, 'id' | 'createdAt'>): Promise<SpecificationChange>
}
