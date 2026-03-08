import { supabaseServer } from '@/shared/infrastructure/supabase/server'
import type { IChangelogRepository } from '../domain/ports/changelog-repository'
import type { SpecificationChange, ChangeType } from '../domain/entities/specification-change'

function toChange(row: Record<string, unknown>): SpecificationChange {
  return {
    id: row.id as string,
    specificationId: row.specification_id as string,
    changeType: row.change_type as ChangeType,
    fieldChanged: row.field_changed as string,
    previousValue: row.previous_value ?? null,
    newValue: row.new_value,
    sessionId: (row.session_id as string) ?? null,
    dialogueTurnId: (row.dialogue_turn_id as string) ?? null,
    changedBy: row.changed_by as string,
    description: (row.description as string) ?? '',
    createdAt: new Date(row.created_at as string),
  }
}

export class SupabaseChangelogRepository implements IChangelogRepository {
  async findBySpec(specificationId: string): Promise<SpecificationChange[]> {
    const { data } = await supabaseServer
      .from('specification_changes')
      .select('*')
      .eq('specification_id', specificationId)
      .order('created_at', { ascending: false })
    return (data ?? []).map(toChange)
  }

  async create(
    change: Omit<SpecificationChange, 'id' | 'createdAt'>
  ): Promise<SpecificationChange> {
    const { data, error } = await supabaseServer
      .from('specification_changes')
      .insert({
        specification_id: change.specificationId,
        change_type: change.changeType,
        field_changed: change.fieldChanged,
        previous_value: change.previousValue,
        new_value: change.newValue,
        session_id: change.sessionId,
        dialogue_turn_id: change.dialogueTurnId,
        changed_by: change.changedBy,
        description: change.description,
      })
      .select()
      .single()
    if (error || !data) throw new Error(`Failed to create changelog entry: ${error?.message}`)
    return toChange(data)
  }
}
