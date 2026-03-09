import type { PersonaType } from '../value-objects/persona-type'

export interface IPromptRepository {
  getActivePrompt(personaType: PersonaType): Promise<string | null>
}
