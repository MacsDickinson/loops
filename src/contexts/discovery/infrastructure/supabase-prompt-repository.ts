import { supabaseServer } from '@/shared/infrastructure/supabase/server'
import type { IPromptRepository } from '../domain/ports/prompt-repository'
import type { PersonaType } from '../domain/value-objects/persona-type'

export class SupabasePromptRepository implements IPromptRepository {
  async getActivePrompt(personaType: PersonaType): Promise<string | null> {
    const { data, error } = await supabaseServer.rpc('get_active_prompt', {
      p_persona_type: personaType,
    })
    if (error) throw new Error(`Failed to get prompt: ${error.message}`)
    return (data as string) ?? null
  }
}
