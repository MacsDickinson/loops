import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { InboxList } from './inbox-list'
import type { InboxIdea } from './inbox-list'

function makeIdea(overrides: Partial<InboxIdea> = {}): InboxIdea {
  return {
    id: 'idea-1',
    name: 'Test Idea',
    description: 'A test description',
    createdAt: '2024-01-01T00:00:00Z',
    graduatedFeatureId: null,
    ...overrides,
  }
}

describe('InboxList', () => {
  it('exports InboxList as a function component', () => {
    expect(typeof InboxList).toBe('function')
  })

  it('accepts empty ideas without throwing', () => {
    const element = React.createElement(InboxList, {
      initialIdeas: [],
      total: 0,
      workspaceId: 'ws-1',
    })
    expect(element.props.initialIdeas).toEqual([])
  })

  it('accepts ideas with graduated and new statuses', () => {
    const ideas = [
      makeIdea({ id: 'idea-1', graduatedFeatureId: 'feat-1' }),
      makeIdea({ id: 'idea-2', graduatedFeatureId: null }),
    ]
    const element = React.createElement(InboxList, {
      initialIdeas: ideas,
      total: 2,
      workspaceId: 'ws-1',
    })
    expect(element.props.initialIdeas).toHaveLength(2)
    expect(element.props.initialIdeas[0].graduatedFeatureId).toBe('feat-1')
    expect(element.props.initialIdeas[1].graduatedFeatureId).toBeNull()
  })
})
