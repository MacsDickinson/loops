import type { PersonaType } from './persona-type'

export interface AgentDefinition {
  type: PersonaType
  name: string
  description: string
  role: 'coach' | 'specialist'
  welcomeMessage: string
}

export const AGENT_CATALOG: readonly AgentDefinition[] = [
  {
    type: 'product_agent',
    name: 'Product Coach',
    description: 'Guides you through defining your product idea with structured questions and maintains the specification.',
    role: 'coach',
    welcomeMessage:
      "Hello! I'm the Product Coach. I'll help you turn your product ideas into precise, testable specifications.\n\nWhat feature would you like to work on today?",
  },
  {
    type: 'security_expert',
    name: 'Security Expert',
    description: 'Reviews your specification for security concerns including authentication, data protection, and access control.',
    role: 'specialist',
    welcomeMessage:
      "Hi, I'm the Security Expert. I've reviewed the context from your Product Coach conversation and I'm ready to help identify security considerations for your specification.\n\nWhat security aspects would you like to explore?",
  },
  {
    type: 'ux_analyst',
    name: 'UX Designer',
    description: 'Provides guidance on user experience, interface design, accessibility, and user journey flows.',
    role: 'specialist',
    welcomeMessage:
      "Hello! I'm the UX Designer. I've reviewed your product discussion and I'm here to help refine the user experience.\n\nWhat UX aspects would you like to focus on?",
  },
  {
    type: 'domain_expert',
    name: 'Domain Expert',
    description: 'Offers deep domain knowledge and helps validate business rules, edge cases, and industry-specific requirements.',
    role: 'specialist',
    welcomeMessage:
      "Hi there! I'm the Domain Expert. I've reviewed the context from your product discussion and I'm ready to help with domain-specific questions.\n\nWhat domain aspects would you like to dive into?",
  },
  {
    type: 'architecture_expert',
    name: 'Architecture Expert',
    description: 'Advises on system architecture, technology choices, scalability, and technical design patterns.',
    role: 'specialist',
    welcomeMessage:
      "Hello! I'm the Architecture Expert. I've reviewed your product context and I'm here to help with technical architecture decisions.\n\nWhat architectural considerations would you like to discuss?",
  },
] as const

export function getAgent(type: PersonaType): AgentDefinition | undefined {
  return AGENT_CATALOG.find((a) => a.type === type)
}

export function getProductCoach(): AgentDefinition {
  return AGENT_CATALOG.find((a) => a.role === 'coach')!
}

export function getSpecialistAgents(): AgentDefinition[] {
  return AGENT_CATALOG.filter((a) => a.role === 'specialist')
}

export function isSpecialistAgent(type: PersonaType): boolean {
  const agent = getAgent(type)
  return agent?.role === 'specialist'
}
