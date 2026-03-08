import { describe, it, expect } from 'vitest'
import { getIdeaDerivedStatus, canGraduate } from './idea'
import type { Idea } from './idea'

function makeIdea(overrides: Partial<Idea> = {}): Idea {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    workspaceId: '00000000-0000-0000-0000-000000000002',
    productId: null,
    name: 'Test Idea',
    description: 'A test idea',
    createdBy: '00000000-0000-0000-0000-000000000003',
    graduatedFeatureId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('Idea', () => {
  describe('getIdeaDerivedStatus', () => {
    it('returns "new" when idea has no spec', () => {
      const idea = makeIdea()
      expect(getIdeaDerivedStatus(idea, false, false, false)).toBe('new')
    })

    it('returns "in_discovery" when idea has an active session', () => {
      const idea = makeIdea()
      expect(getIdeaDerivedStatus(idea, true, true, false)).toBe('in_discovery')
    })

    it('returns "in_discovery" when idea has spec but no active session', () => {
      const idea = makeIdea()
      expect(getIdeaDerivedStatus(idea, true, false, false)).toBe('in_discovery')
    })

    it('returns "discovered" when spec is complete', () => {
      const idea = makeIdea()
      expect(getIdeaDerivedStatus(idea, true, false, true)).toBe('discovered')
    })

    it('returns "graduated" when graduated_feature_id is set', () => {
      const idea = makeIdea({ graduatedFeatureId: 'feature-1' })
      expect(getIdeaDerivedStatus(idea, true, false, true)).toBe('graduated')
    })
  })

  describe('canGraduate', () => {
    it('returns true when spec is complete and idea is not graduated', () => {
      const idea = makeIdea()
      expect(canGraduate(idea, true)).toBe(true)
    })

    it('returns false when spec is not complete', () => {
      const idea = makeIdea()
      expect(canGraduate(idea, false)).toBe(false)
    })

    it('returns false when idea is already graduated', () => {
      const idea = makeIdea({ graduatedFeatureId: 'feature-1' })
      expect(canGraduate(idea, true)).toBe(false)
    })
  })
})
