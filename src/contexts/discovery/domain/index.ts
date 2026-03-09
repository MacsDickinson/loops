export type {
  Specification,
  Requirement,
  AcceptanceTest,
} from './entities/specification'
export { canComplete, isOwnedByIdeaOrFeature } from './entities/specification'
export type { SpecificationChange, ChangeType } from './entities/specification-change'
export type {
  DiscoverySession,
  SessionStatus,
} from './entities/discovery-session'
export { canTransitionSession } from './entities/discovery-session'
export type { DialogueTurn } from './entities/dialogue-turn'
export type { PersonaType } from './value-objects/persona-type'
export { PersonaTypes } from './value-objects/persona-type'
export type { SpecStatus } from './value-objects/spec-status'
export { SpecStatuses } from './value-objects/spec-status'
