import { supabaseServer } from '@/shared/infrastructure/supabase/server'
import type { IProductRepository } from '../domain/ports/product-repository'
import type { Product } from '../domain/entities/product'
import type { ProductLifecycleStage } from '../domain/value-objects/lifecycle-stage'

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    lifecycleStage: row.lifecycle_stage as ProductLifecycleStage,
    createdBy: row.created_by as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

export class SupabaseProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const { data } = await supabaseServer
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    return data ? toProduct(data) : null
  }

  async findByWorkspace(workspaceId: string): Promise<Product[]> {
    const { data } = await supabaseServer
      .from('products')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    return (data ?? []).map(toProduct)
  }

  async create(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> {
    const { data, error } = await supabaseServer
      .from('products')
      .insert({
        workspace_id: product.workspaceId,
        name: product.name,
        description: product.description,
        lifecycle_stage: product.lifecycleStage,
        created_by: product.createdBy,
      })
      .select()
      .single()
    if (error || !data) throw new Error(`Failed to create product: ${error?.message}`)
    return toProduct(data)
  }

  async update(
    id: string,
    data: Partial<Pick<Product, 'name' | 'description' | 'lifecycleStage'>>
  ): Promise<Product> {
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.lifecycleStage !== undefined) updateData.lifecycle_stage = data.lifecycleStage

    const { data: row, error } = await supabaseServer
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error || !row) throw new Error(`Failed to update product: ${error?.message}`)
    return toProduct(row)
  }
}
