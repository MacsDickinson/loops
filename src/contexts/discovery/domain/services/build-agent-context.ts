import type { PersonaType } from '../value-objects/persona-type'
import type { DialogueTurn } from '../entities/dialogue-turn'

const MAX_CONTEXT_LENGTH = 8000

/**
 * Builds context from the Product Coach conversation for specialist agents.
 * Product Coach sessions don't need context injection (they are the primary source).
 */
export function buildAgentContext(
  agentType: PersonaType,
  coachTurns: DialogueTurn[],
  prdMarkdown: string,
): string {
  if (agentType === 'product_agent') {
    return ''
  }

  const parts: string[] = []

  if (prdMarkdown) {
    parts.push('## Current PRD\n\n' + prdMarkdown)
  }

  if (coachTurns.length > 0) {
    parts.push('## Product Coach Conversation Summary\n')
    for (const turn of coachTurns) {
      parts.push(`**User:** ${turn.question}`)
      parts.push(`**Product Coach:** ${turn.answer}\n`)
    }
  }

  let context = parts.join('\n')

  if (context.length > MAX_CONTEXT_LENGTH) {
    context = context.slice(0, MAX_CONTEXT_LENGTH) + '\n\n[Context truncated for length]'
  }

  return context
}
