export type IdeaDerivedStatus = 'new' | 'in_discovery' | 'discovered' | 'graduated'

export interface Idea {
  id: string
  workspaceId: string
  productId: string | null
  name: string
  description: string
  createdBy: string
  graduatedFeatureId: string | null
  createdAt: Date
  updatedAt: Date
}

export function getIdeaDerivedStatus(
  idea: Idea,
  hasSpec: boolean,
  hasActiveSession: boolean,
  specComplete: boolean
): IdeaDerivedStatus {
  if (idea.graduatedFeatureId) return 'graduated'
  if (specComplete) return 'discovered'
  if (hasActiveSession) return 'in_discovery'
  if (hasSpec) return 'in_discovery'
  return 'new'
}

export function canGraduate(
  idea: Idea,
  specComplete: boolean
): boolean {
  return specComplete && !idea.graduatedFeatureId
}
