import type { Specification } from '../entities/specification'
import type { SpecStatus } from '../value-objects/spec-status'

export interface ISpecificationRepository {
  findById(id: string): Promise<Specification | null>
  findByIdea(ideaId: string): Promise<Specification | null>
  findByFeature(featureId: string): Promise<Specification[]>
  findByWorkspace(workspaceId: string): Promise<Specification[]>
  create(spec: Omit<Specification, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<Specification>
  update(id: string, data: Partial<Pick<Specification, 'title' | 'description' | 'prdMarkdown' | 'status' | 'requirements' | 'acceptanceTests' | 'linkedGithubPr' | 'linkedLinearIssue'>>): Promise<Specification>
  updateStatus(id: string, status: SpecStatus): Promise<Specification>
}
