import { describe, it, expect } from 'vitest'
import { canTransitionSession } from './discovery-session'

describe('DiscoverySession', () => {
  describe('canTransitionSession', () => {
    it('allows active to paused', () => {
      expect(canTransitionSession('active', 'paused')).toBe(true)
    })

    it('allows active to completed', () => {
      expect(canTransitionSession('active', 'completed')).toBe(true)
    })

    it('allows active to abandoned', () => {
      expect(canTransitionSession('active', 'abandoned')).toBe(true)
    })

    it('allows paused to active (resume)', () => {
      expect(canTransitionSession('paused', 'active')).toBe(true)
    })

    it('allows paused to abandoned', () => {
      expect(canTransitionSession('paused', 'abandoned')).toBe(true)
    })

    it('disallows completed to any state', () => {
      expect(canTransitionSession('completed', 'active')).toBe(false)
      expect(canTransitionSession('completed', 'paused')).toBe(false)
    })

    it('disallows abandoned to any state', () => {
      expect(canTransitionSession('abandoned', 'active')).toBe(false)
      expect(canTransitionSession('abandoned', 'paused')).toBe(false)
    })
  })
})
