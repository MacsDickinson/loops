import type { PersonaType } from '../value-objects/persona-type'

export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned'

export interface DiscoverySession {
  id: string
  specificationId: string
  startedBy: string
  status: SessionStatus
  personasUsed: PersonaType[]
  startedAt: Date
  completedAt: Date | null
}

const sessionTransitions: Record<SessionStatus, SessionStatus[]> = {
  active: ['paused', 'completed', 'abandoned'],
  paused: ['active', 'abandoned'],
  completed: [],
  abandoned: [],
}

export function canTransitionSession(
  from: SessionStatus,
  to: SessionStatus
): boolean {
  return sessionTransitions[from].includes(to)
}
