import { supabaseServer } from '@/shared/infrastructure/supabase/server'
import type { IWorkspaceRepository } from '../domain/ports/workspace-repository'
import type { Workspace } from '../domain/entities/workspace'

function toWorkspace(row: Record<string, unknown>): Workspace {
  return {
    id: row.id as string,
    name: row.name as string,
    ownerUserId: row.owner_user_id as string,
    subscriptionTier: row.subscription_tier as Workspace['subscriptionTier'],
    settings: (row.settings as Record<string, unknown>) ?? {},
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

export class SupabaseWorkspaceRepository implements IWorkspaceRepository {
  async findById(id: string): Promise<Workspace | null> {
    const { data } = await supabaseServer
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single()
    return data ? toWorkspace(data) : null
  }

  async findByOwner(ownerUserId: string): Promise<Workspace[]> {
    const { data } = await supabaseServer
      .from('workspaces')
      .select('*')
      .eq('owner_user_id', ownerUserId)
    return (data ?? []).map(toWorkspace)
  }

  async create(
    workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Workspace> {
    const { data, error } = await supabaseServer
      .from('workspaces')
      .insert({
        name: workspace.name,
        owner_user_id: workspace.ownerUserId,
        subscription_tier: workspace.subscriptionTier,
        settings: workspace.settings,
      })
      .select()
      .single()
    if (error || !data) throw new Error(`Failed to create workspace: ${error?.message}`)
    return toWorkspace(data)
  }

  async update(
    id: string,
    data: Partial<Pick<Workspace, 'name' | 'settings'>>
  ): Promise<Workspace> {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.settings !== undefined) updateData.settings = data.settings

    const { data: row, error } = await supabaseServer
      .from('workspaces')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error || !row) throw new Error(`Failed to update workspace: ${error?.message}`)
    return toWorkspace(row)
  }
}
