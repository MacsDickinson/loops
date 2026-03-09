import { supabaseServer } from '@/shared/infrastructure/supabase/server'
import type { IIdeaRepository } from '../domain/ports/idea-repository'
import type { Idea } from '../domain/entities/idea'

function toIdea(row: Record<string, unknown>): Idea {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    productId: (row.product_id as string) ?? null,
    name: row.name as string,
    description: (row.description as string) ?? '',
    createdBy: row.created_by as string,
    graduatedFeatureId: (row.graduated_feature_id as string) ?? null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

export class SupabaseIdeaRepository implements IIdeaRepository {
  async findById(id: string): Promise<Idea | null> {
    const { data } = await supabaseServer
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single()
    return data ? toIdea(data) : null
  }

  async findByWorkspace(workspaceId: string): Promise<Idea[]> {
    const { data } = await supabaseServer
      .from('ideas')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    return (data ?? []).map(toIdea)
  }

  async findInbox(workspaceId: string): Promise<Idea[]> {
    const { data } = await supabaseServer
      .from('ideas')
      .select('*')
      .eq('workspace_id', workspaceId)
      .is('product_id', null)
      .order('created_at', { ascending: false })
    return (data ?? []).map(toIdea)
  }

  async findByProduct(productId: string): Promise<Idea[]> {
    const { data } = await supabaseServer
      .from('ideas')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    return (data ?? []).map(toIdea)
  }

  async create(
    idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'graduatedFeatureId'>
  ): Promise<Idea> {
    const { data, error } = await supabaseServer
      .from('ideas')
      .insert({
        workspace_id: idea.workspaceId,
        product_id: idea.productId,
        name: idea.name,
        description: idea.description,
        created_by: idea.createdBy,
      })
      .select()
      .single()
    if (error || !data) throw new Error(`Failed to create idea: ${error?.message}`)
    return toIdea(data)
  }

  async update(
    id: string,
    data: Partial<Pick<Idea, 'name' | 'description' | 'productId'>>
  ): Promise<Idea> {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.productId !== undefined) updateData.product_id = data.productId

    const { data: row, error } = await supabaseServer
      .from('ideas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error || !row) throw new Error(`Failed to update idea: ${error?.message}`)
    return toIdea(row)
  }
}
