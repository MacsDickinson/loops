export const SpecStatuses = ['draft', 'complete', 'archived'] as const

export type SpecStatus = (typeof SpecStatuses)[number]
