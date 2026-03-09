import { describe, it, expect } from 'vitest'
import {
  AGENT_CATALOG,
  getAgent,
  getSpecialistAgents,
  getProductCoach,
  isSpecialistAgent,
} from './agent-catalog'
import { PersonaTypes } from './persona-type'

describe('AgentCatalog', () => {
  it('should contain exactly 5 agents matching the PRD catalog', () => {
    expect(AGENT_CATALOG).toHaveLength(5)
  })

  it('should include Product Coach as product_agent', () => {
    const coach = getProductCoach()
    expect(coach).toBeDefined()
    expect(coach.type).toBe('product_agent')
    expect(coach.name).toBe('Product Coach')
    expect(coach.role).toBe('coach')
  })

  it('should include Security Expert', () => {
    const agent = getAgent('security_expert')
    expect(agent).toBeDefined()
    expect(agent!.name).toBe('Security Expert')
    expect(agent!.role).toBe('specialist')
  })

  it('should include UX Designer', () => {
    const agent = getAgent('ux_analyst')
    expect(agent).toBeDefined()
    expect(agent!.name).toBe('UX Designer')
    expect(agent!.role).toBe('specialist')
  })

  it('should include Domain Expert', () => {
    const agent = getAgent('domain_expert')
    expect(agent).toBeDefined()
    expect(agent!.name).toBe('Domain Expert')
    expect(agent!.role).toBe('specialist')
  })

  it('should include Architecture Expert', () => {
    const agent = getAgent('architecture_expert')
    expect(agent).toBeDefined()
    expect(agent!.name).toBe('Architecture Expert')
    expect(agent!.role).toBe('specialist')
  })

  it('should return undefined for unknown agent types', () => {
    expect(getAgent('unknown_agent' as never)).toBeUndefined()
  })

  it('should return only specialist agents (not Product Coach)', () => {
    const specialists = getSpecialistAgents()
    expect(specialists).toHaveLength(4)
    expect(specialists.every((a) => a.role === 'specialist')).toBe(true)
    expect(specialists.find((a) => a.type === 'product_agent')).toBeUndefined()
  })

  it('should identify specialist agents correctly', () => {
    expect(isSpecialistAgent('product_agent')).toBe(false)
    expect(isSpecialistAgent('security_expert')).toBe(true)
    expect(isSpecialistAgent('ux_analyst')).toBe(true)
    expect(isSpecialistAgent('domain_expert')).toBe(true)
    expect(isSpecialistAgent('architecture_expert')).toBe(true)
  })

  it('should have a welcome message for every agent', () => {
    for (const agent of AGENT_CATALOG) {
      expect(agent.welcomeMessage).toBeTruthy()
      expect(agent.welcomeMessage.length).toBeGreaterThan(10)
    }
  })

  it('should have a description for every agent', () => {
    for (const agent of AGENT_CATALOG) {
      expect(agent.description).toBeTruthy()
    }
  })

  it('every agent type should be in PersonaTypes', () => {
    for (const agent of AGENT_CATALOG) {
      expect(PersonaTypes).toContain(agent.type)
    }
  })
})
