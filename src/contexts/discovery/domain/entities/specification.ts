import type { SpecStatus } from '../value-objects/spec-status'

export interface Requirement {
  id: string
  text: string
  category: 'functional' | 'non_functional' | 'security' | 'performance' | 'ux' | 'business_rule'
  priority: 'critical' | 'high' | 'medium' | 'low'
  linkedTestIds: string[]
}

export interface AcceptanceTest {
  id: string
  scenario: string
  given: string
  when: string
  then: string
  linkedRequirementIds: string[]
}

export interface Specification {
  id: string
  workspaceId: string
  ideaId: string | null
  featureId: string | null
  createdBy: string
  title: string
  description: string
  requirements: Requirement[]
  acceptanceTests: AcceptanceTest[]
  status: SpecStatus
  linkedGithubPr: string | null
  linkedLinearIssue: string | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

export function canComplete(spec: Specification): boolean {
  return spec.requirements.length > 0 && spec.acceptanceTests.length > 0
}

export function isOwnedByIdeaOrFeature(spec: Specification): boolean {
  return spec.ideaId !== null || spec.featureId !== null
}
