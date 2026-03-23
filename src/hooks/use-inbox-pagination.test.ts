import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildInboxUrl, fetchNextPage, PAGE_SIZE } from './use-inbox-pagination'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('buildInboxUrl', () => {
  it('builds correct URL with workspace, limit, and offset', () => {
    const url = buildInboxUrl('ws-123', 25, 0)
    expect(url).toBe('/api/workspaces/ws-123/inbox?limit=25&offset=0')
  })

  it('encodes offset based on current count', () => {
    const url = buildInboxUrl('ws-1', 10, 50)
    expect(url).toBe('/api/workspaces/ws-1/inbox?limit=10&offset=50')
  })
})

describe('PAGE_SIZE', () => {
  it('is 25', () => {
    expect(PAGE_SIZE).toBe(25)
  })
})

describe('fetchNextPage', () => {
  it('fetches correct URL with offset matching current count', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ideas: [] }),
    })

    await fetchNextPage('ws-1', 25, mockFetch)

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/workspaces/ws-1/inbox?limit=${PAGE_SIZE}&offset=25`
    )
  })

  it('increments offset on successive calls', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ideas: [{ id: 'idea-26' }] }),
    })

    // First page loaded 25 items server-side, now loading page 2
    await fetchNextPage('ws-1', 25, mockFetch)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('offset=25')
    )

    // After page 2 loaded, we'd have 50 items, so offset=50
    await fetchNextPage('ws-1', 50, mockFetch)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('offset=50')
    )
  })

  it('returns ideas from successful response', async () => {
    const ideas = [
      { id: 'idea-1', name: 'Idea 1', description: 'Desc', createdAt: '2024-01-01T00:00:00Z', graduatedFeatureId: null },
      { id: 'idea-2', name: 'Idea 2', description: 'Desc', createdAt: '2024-01-02T00:00:00Z', graduatedFeatureId: 'feat-1' },
    ]
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ideas }),
    })

    const result = await fetchNextPage('ws-1', 0, mockFetch)

    expect(result.ideas).toEqual(ideas)
    expect(result.error).toBeNull()
  })

  it('returns empty ideas array when response has no ideas field', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const result = await fetchNextPage('ws-1', 0, mockFetch)

    expect(result.ideas).toEqual([])
    expect(result.error).toBeNull()
  })

  it('returns error on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ error: 'Forbidden' }),
    })

    const result = await fetchNextPage('ws-1', 0, mockFetch)

    expect(result.ideas).toEqual([])
    expect(result.error).toBe('Request failed (403)')
  })

  it('returns error on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const result = await fetchNextPage('ws-1', 0, mockFetch)

    expect(result.ideas).toEqual([])
    expect(result.error).toBe('Network error')
  })

  it('returns generic error message for non-Error throws', async () => {
    mockFetch.mockRejectedValue('unknown failure')

    const result = await fetchNextPage('ws-1', 0, mockFetch)

    expect(result.ideas).toEqual([])
    expect(result.error).toBe('Failed to load more ideas')
  })

  it('uses correct workspace ID in URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ideas: [] }),
    })

    await fetchNextPage('workspace-abc-123', 0, mockFetch)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/workspaces/workspace-abc-123/inbox')
    )
  })
})
