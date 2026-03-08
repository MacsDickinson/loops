import { describe, it, expect } from 'vitest'
import { canTransitionFeature, getNextFeatureStage } from './lifecycle-stage'

describe('FeatureLifecycleStage', () => {
  describe('getNextFeatureStage', () => {
    it('returns incubating after pilot', () => {
      expect(getNextFeatureStage('pilot')).toBe('incubating')
    })

    it('returns graduating after incubating', () => {
      expect(getNextFeatureStage('incubating')).toBe('graduating')
    })

    it('returns growth after graduating', () => {
      expect(getNextFeatureStage('graduating')).toBe('growth')
    })

    it('returns sunset after growth', () => {
      expect(getNextFeatureStage('growth')).toBe('sunset')
    })

    it('returns null after sunset (terminal stage)', () => {
      expect(getNextFeatureStage('sunset')).toBeNull()
    })
  })

  describe('canTransitionFeature', () => {
    it('allows pilot to incubating', () => {
      expect(canTransitionFeature('pilot', 'incubating')).toBe(true)
    })

    it('disallows skipping stages', () => {
      expect(canTransitionFeature('pilot', 'growth')).toBe(false)
    })

    it('disallows backwards transitions', () => {
      expect(canTransitionFeature('incubating', 'pilot')).toBe(false)
    })

    it('disallows transitioning from sunset', () => {
      expect(canTransitionFeature('sunset', 'pilot')).toBe(false)
    })
  })
})
