import { supabaseServer } from '@/shared/infrastructure/supabase/server'
import type { ISpecificationRepository } from '../domain/ports/specification-repository'
import type { Specification, Requirement, AcceptanceTest } from '../domain/entities/specification'
import type { SpecStatus } from '../domain/value-objects/spec-status'

function toSpec(row: Record<string, unknown>): Specification {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    ideaId: (row.idea_id as string) ?? null,
    featureId: (row.feature_id as string) ?? null,
    createdBy: row.created_by as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    prdMarkdown: (row.prd_markdown as string) ?? '',
    requirements: (row.requirements_json as Requirement[]) ?? [],
    acceptanceTests: (row.acceptance_tests_json as AcceptanceTest[]) ?? [],
    status: row.status as SpecStatus,
    linkedGithubPr: (row.linked_github_pr as string) ?? null,
    linkedLinearIssue: (row.linked_linear_issue as string) ?? null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    completedAt: row.completed_at ? new Date(row.completed_at as string) : null,
  }
}

export class SupabaseSpecificationRepository implements ISpecificationRepository {
  async findById(id: string): Promise<Specification | null> {
    const { data } = await supabaseServer
      .from('specifications')
      .select('*')
      .eq('id', id)
      .single()
    return data ? toSpec(data) : null
  }

  async findByIdea(ideaId: string): Promise<Specification | null> {
    const { data } = await supabaseServer
      .from('specifications')
      .select('*')
      .eq('idea_id', ideaId)
      .single()
    return data ? toSpec(data) : null
  }

  async findByFeature(featureId: string): Promise<Specification[]> {
    const { data } = await supabaseServer
      .from('specifications')
      .select('*')
      .eq('feature_id', featureId)
      .order('created_at', { ascending: false })
    return (data ?? []).map(toSpec)
  }

  async findByWorkspace(workspaceId: string): Promise<Specification[]> {
    const { data } = await supabaseServer
      .from('specifications')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    return (data ?? []).map(toSpec)
  }

  async create(
    spec: Omit<Specification, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>
  ): Promise<Specification> {
    const { data, error } = await supabaseServer
      .from('specifications')
      .insert({
        workspace_id: spec.workspaceId,
        idea_id: spec.ideaId,
        feature_id: spec.featureId,
        created_by: spec.createdBy,
        title: spec.title,
        description: spec.description,
        prd_markdown: spec.prdMarkdown,
        requirements_json: spec.requirements,
        acceptance_tests_json: spec.acceptanceTests,
        status: spec.status,
        linked_github_pr: spec.linkedGithubPr,
        linked_linear_issue: spec.linkedLinearIssue,
      })
      .select()
      .single()
    if (error || !data) throw new Error(`Failed to create specification: ${error?.message}`)
    return toSpec(data)
  }

  async update(
    id: string,
    data: Partial<Pick<Specification, 'title' | 'description' | 'prdMarkdown' | 'status' | 'requirements' | 'acceptanceTests' | 'linkedGithubPr' | 'linkedLinearIssue'>>
  ): Promise<Specification> {
    const updateData: Record<string, unknown> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.prdMarkdown !== undefined) updateData.prd_markdown = data.prdMarkdown
    if (data.status !== undefined) updateData.status = data.status
    if (data.requirements !== undefined) updateData.requirements_json = data.requirements
    if (data.acceptanceTests !== undefined) updateData.acceptance_tests_json = data.acceptanceTests
    if (data.linkedGithubPr !== undefined) updateData.linked_github_pr = data.linkedGithubPr
    if (data.linkedLinearIssue !== undefined) updateData.linked_linear_issue = data.linkedLinearIssue
    if (data.status === 'complete') updateData.completed_at = new Date().toISOString()

    const { data: row, error } = await supabaseServer
      .from('specifications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error || !row) throw new Error(`Failed to update specification: ${error?.message}`)
    return toSpec(row)
  }

  async updateStatus(id: string, status: SpecStatus): Promise<Specification> {
    return this.update(id, { status })
  }
}
