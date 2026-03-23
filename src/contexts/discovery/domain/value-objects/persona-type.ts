export const PersonaTypes = [
  'product_agent',
  'security_expert',
  'ux_analyst',
  'domain_expert',
  'architecture_expert',
] as const

export type PersonaType = (typeof PersonaTypes)[number]
