export type ChangeType = 'ai_generated' | 'manual'

export interface SpecificationChange {
  id: string
  specificationId: string
  changeType: ChangeType
  fieldChanged: string
  previousValue: unknown | null
  newValue: unknown
  sessionId: string | null
  dialogueTurnId: string | null
  changedBy: string
  description: string
  createdAt: Date
}
