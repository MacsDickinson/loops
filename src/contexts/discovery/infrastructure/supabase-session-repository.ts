import { supabaseServer } from '@/shared/infrastructure/supabase/server'
import type { ISessionRepository } from '../domain/ports/session-repository'
import type { DiscoverySession, SessionStatus } from '../domain/entities/discovery-session'
import type { DialogueTurn } from '../domain/entities/dialogue-turn'
import type { PersonaType } from '../domain/value-objects/persona-type'

function toSession(row: Record<string, unknown>): DiscoverySession {
  return {
    id: row.id as string,
    specificationId: row.specification_id as string,
    startedBy: row.started_by as string,
    status: row.status as SessionStatus,
    agentType: (row.agent_type as PersonaType) ?? 'product_agent',
    personasUsed: (row.personas_used as PersonaType[]) ?? [],
    startedAt: new Date(row.started_at as string),
    completedAt: row.completed_at ? new Date(row.completed_at as string) : null,
  }
}

function toTurn(row: Record<string, unknown>): DialogueTurn {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    personaType: row.persona_type as PersonaType,
    question: row.question as string,
    answer: row.answer as string,
    turnOrder: row.turn_order as number,
    tokensUsed: (row.tokens_used as number) ?? null,
    latencyMs: (row.latency_ms as number) ?? null,
    createdAt: new Date(row.created_at as string),
  }
}

export class SupabaseSessionRepository implements ISessionRepository {
  async findById(id: string): Promise<DiscoverySession | null> {
    const { data } = await supabaseServer
      .from('discovery_sessions')
      .select('*')
      .eq('id', id)
      .single()
    return data ? toSession(data) : null
  }

  async findActiveBySpec(specificationId: string): Promise<DiscoverySession | null> {
    const { data } = await supabaseServer
      .from('discovery_sessions')
      .select('*')
      .eq('specification_id', specificationId)
      .eq('status', 'active')
      .single()
    return data ? toSession(data) : null
  }

  async findBySpec(specificationId: string): Promise<DiscoverySession[]> {
    const { data } = await supabaseServer
      .from('discovery_sessions')
      .select('*')
      .eq('specification_id', specificationId)
      .order('started_at', { ascending: false })
    return (data ?? []).map(toSession)
  }

  async create(
    session: Omit<DiscoverySession, 'id' | 'startedAt' | 'completedAt'>
  ): Promise<DiscoverySession> {
    const { data, error } = await supabaseServer
      .from('discovery_sessions')
      .insert({
        specification_id: session.specificationId,
        started_by: session.startedBy,
        status: session.status,
        agent_type: session.agentType,
        personas_used: session.personasUsed,
      })
      .select()
      .single()
    if (error || !data) throw new Error(`Failed to create session: ${error?.message}`)
    return toSession(data)
  }

  async updateStatus(
    id: string,
    status: SessionStatus
  ): Promise<DiscoverySession> {
    const updateData: Record<string, unknown> = { status }
    if (status === 'completed' || status === 'abandoned') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabaseServer
      .from('discovery_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error || !data) throw new Error(`Failed to update session: ${error?.message}`)
    return toSession(data)
  }

  async findProductCoachSession(specificationId: string): Promise<DiscoverySession | null> {
    const { data } = await supabaseServer
      .from('discovery_sessions')
      .select('*')
      .eq('specification_id', specificationId)
      .eq('agent_type', 'product_agent')
      .order('started_at', { ascending: false })
      .limit(1)
      .single()
    return data ? toSession(data) : null
  }

  async addDialogueTurn(
    turn: Omit<DialogueTurn, 'id' | 'createdAt'>
  ): Promise<DialogueTurn> {
    const { data, error } = await supabaseServer
      .from('dialogue_turns')
      .insert({
        session_id: turn.sessionId,
        persona_type: turn.personaType,
        question: turn.question,
        answer: turn.answer,
        turn_order: turn.turnOrder,
        tokens_used: turn.tokensUsed,
        latency_ms: turn.latencyMs,
      })
      .select()
      .single()
    if (error || !data) throw new Error(`Failed to add dialogue turn: ${error?.message}`)
    return toTurn(data)
  }

  async getDialogueTurns(sessionId: string): Promise<DialogueTurn[]> {
    const { data } = await supabaseServer
      .from('dialogue_turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_order', { ascending: true })
    return (data ?? []).map(toTurn)
  }
}
