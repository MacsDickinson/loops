import type { Workspace } from '../entities/workspace'

export interface IWorkspaceRepository {
  findById(id: string): Promise<Workspace | null>
  findByOwner(ownerUserId: string): Promise<Workspace[]>
  create(workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workspace>
  update(id: string, data: Partial<Pick<Workspace, 'name' | 'settings'>>): Promise<Workspace>
}
