import { describe, it, expect } from 'vitest'
import { canComplete, isOwnedByIdeaOrFeature } from './specification'
import type { Specification } from './specification'

function makeSpec(overrides: Partial<Specification> = {}): Specification {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    workspaceId: '00000000-0000-0000-0000-000000000002',
    ideaId: '00000000-0000-0000-0000-000000000003',
    featureId: null,
    createdBy: '00000000-0000-0000-0000-000000000004',
    title: 'Test Spec',
    description: 'A test specification',
    requirements: [],
    acceptanceTests: [],
    status: 'draft',
    linkedGithubPr: null,
    linkedLinearIssue: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    ...overrides,
  }
}

describe('Specification', () => {
  describe('canComplete', () => {
    it('returns false when there are no requirements', () => {
      const spec = makeSpec({ requirements: [], acceptanceTests: [{ id: '1', scenario: 's', given: 'g', when: 'w', then: 't', linkedRequirementIds: [] }] })
      expect(canComplete(spec)).toBe(false)
    })

    it('returns false when there are no acceptance tests', () => {
      const spec = makeSpec({ requirements: [{ id: '1', text: 'r', category: 'functional', priority: 'high', linkedTestIds: [] }], acceptanceTests: [] })
      expect(canComplete(spec)).toBe(false)
    })

    it('returns true when both requirements and acceptance tests exist', () => {
      const spec = makeSpec({
        requirements: [{ id: '1', text: 'r', category: 'functional', priority: 'high', linkedTestIds: [] }],
        acceptanceTests: [{ id: '2', scenario: 's', given: 'g', when: 'w', then: 't', linkedRequirementIds: [] }],
      })
      expect(canComplete(spec)).toBe(true)
    })
  })

  describe('isOwnedByIdeaOrFeature', () => {
    it('returns true when ideaId is set', () => {
      const spec = makeSpec({ ideaId: 'some-id', featureId: null })
      expect(isOwnedByIdeaOrFeature(spec)).toBe(true)
    })

    it('returns true when featureId is set', () => {
      const spec = makeSpec({ ideaId: null, featureId: 'some-id' })
      expect(isOwnedByIdeaOrFeature(spec)).toBe(true)
    })

    it('returns false when neither is set', () => {
      const spec = makeSpec({ ideaId: null, featureId: null })
      expect(isOwnedByIdeaOrFeature(spec)).toBe(false)
    })
  })
})
