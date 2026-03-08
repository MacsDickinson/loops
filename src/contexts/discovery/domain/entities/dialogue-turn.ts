import type { PersonaType } from '../value-objects/persona-type'

export interface DialogueTurn {
  id: string
  sessionId: string
  personaType: PersonaType
  question: string
  answer: string
  turnOrder: number
  tokensUsed: number | null
  latencyMs: number | null
  createdAt: Date
}
