import { supabaseServer } from '@/shared/infrastructure/supabase/server'
import type { IFeatureRepository } from '../domain/ports/feature-repository'
import type { Feature } from '../domain/entities/feature'
import type { FeatureLifecycleStage } from '../domain/value-objects/lifecycle-stage'

function toFeature(row: Record<string, unknown>): Feature {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    productId: row.product_id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    lifecycleStage: row.lifecycle_stage as FeatureLifecycleStage,
    sourceIdeaId: row.source_idea_id as string,
    parentFeatureId: (row.parent_feature_id as string) ?? null,
    createdBy: row.created_by as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

export class SupabaseFeatureRepository implements IFeatureRepository {
  async findById(id: string): Promise<Feature | null> {
    const { data } = await supabaseServer
      .from('features')
      .select('*')
      .eq('id', id)
      .single()
    return data ? toFeature(data) : null
  }

  async findByProduct(productId: string): Promise<Feature[]> {
    const { data } = await supabaseServer
      .from('features')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    return (data ?? []).map(toFeature)
  }

  async findByWorkspace(workspaceId: string): Promise<Feature[]> {
    const { data } = await supabaseServer
      .from('features')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    return (data ?? []).map(toFeature)
  }

  async update(
    id: string,
    data: Partial<Pick<Feature, 'name' | 'description' | 'lifecycleStage'>>
  ): Promise<Feature> {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.lifecycleStage !== undefined) updateData.lifecycle_stage = data.lifecycleStage

    const { data: row, error } = await supabaseServer
      .from('features')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error || !row) throw new Error(`Failed to update feature: ${error?.message}`)
    return toFeature(row)
  }

  async updateLifecycleStage(
    id: string,
    stage: FeatureLifecycleStage
  ): Promise<Feature> {
    return this.update(id, { lifecycleStage: stage })
  }
}
