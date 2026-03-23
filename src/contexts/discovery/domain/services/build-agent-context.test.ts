import { describe, it, expect } from 'vitest'
import { buildAgentContext } from './build-agent-context'
import type { DialogueTurn } from '../entities/dialogue-turn'

const makeTurn = (
  overrides: Partial<DialogueTurn> & { question: string; answer: string }
): DialogueTurn => ({
  id: crypto.randomUUID(),
  sessionId: 'session-1',
  personaType: 'product_agent',
  turnOrder: 1,
  tokensUsed: null,
  latencyMs: null,
  createdAt: new Date(),
  ...overrides,
})

describe('buildAgentContext', () => {
  it('should return empty string for product_agent (no context needed)', () => {
    const result = buildAgentContext('product_agent', [], '')
    expect(result).toBe('')
  })

  it('should include PRD summary for specialist agents', () => {
    const result = buildAgentContext('security_expert', [], '# My PRD\n\nSome requirements here')
    expect(result).toContain('# My PRD')
    expect(result).toContain('Some requirements here')
  })

  it('should include Product Coach conversation summary for specialist agents', () => {
    const coachTurns: DialogueTurn[] = [
      makeTurn({ question: 'Tell me about SSO login', answer: 'We want Google and Microsoft SSO.' }),
      makeTurn({ question: 'What about MFA?', answer: 'Yes, MFA is required for admin users.' }),
    ]
    const result = buildAgentContext('security_expert', coachTurns, '')
    expect(result).toContain('SSO login')
    expect(result).toContain('Google and Microsoft SSO')
    expect(result).toContain('MFA')
  })

  it('should truncate context when conversation is very long', () => {
    const longTurns: DialogueTurn[] = Array.from({ length: 50 }, (_, i) =>
      makeTurn({
        question: `Question ${i} ${'x'.repeat(500)}`,
        answer: `Answer ${i} ${'y'.repeat(500)}`,
        turnOrder: i,
      })
    )
    const result = buildAgentContext('ux_analyst', longTurns, '')
    // Should not exceed a reasonable length (we'll cap at ~8000 chars)
    expect(result.length).toBeLessThan(10000)
  })

  it('should work for all specialist agent types', () => {
    const turns = [makeTurn({ question: 'Hi', answer: 'Hello' })]
    for (const type of ['security_expert', 'ux_analyst', 'domain_expert', 'architecture_expert'] as const) {
      const result = buildAgentContext(type, turns, '# PRD')
      expect(result).toBeTruthy()
    }
  })
})
