import type { DiscoverySession } from '../entities/discovery-session'
import type { DialogueTurn } from '../entities/dialogue-turn'

export interface ISessionRepository {
  findById(id: string): Promise<DiscoverySession | null>
  findActiveBySpec(specificationId: string): Promise<DiscoverySession | null>
  findBySpec(specificationId: string): Promise<DiscoverySession[]>
  findProductCoachSession(specificationId: string): Promise<DiscoverySession | null>
  create(session: Omit<DiscoverySession, 'id' | 'startedAt' | 'completedAt'>): Promise<DiscoverySession>
  updateStatus(id: string, status: DiscoverySession['status']): Promise<DiscoverySession>
  addDialogueTurn(turn: Omit<DialogueTurn, 'id' | 'createdAt'>): Promise<DialogueTurn>
  getDialogueTurns(sessionId: string): Promise<DialogueTurn[]>
}
