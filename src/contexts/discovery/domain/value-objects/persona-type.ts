export const PersonaTypes = [
  'product_coach',
  'security_expert',
  'ux_analyst',
  'domain_expert',
] as const

export type PersonaType = (typeof PersonaTypes)[number]
