import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockIs = vi.fn()
const mockOrder = vi.fn()
const mockRange = vi.fn()

vi.mock('@/shared/infrastructure/supabase/server', () => ({
  supabaseServer: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

function setupPaginatedChain(result: { data: unknown[]; count: number | null; error: unknown }) {
  mockFrom.mockReturnValue({ select: mockSelect })
  mockSelect.mockReturnValue({ eq: mockEq })
  mockEq.mockReturnValue({ is: mockIs })
  mockIs.mockReturnValue({ order: mockOrder })
  mockOrder.mockReturnValue({ range: mockRange })
  mockRange.mockResolvedValue(result)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SupabaseIdeaRepository.findInboxPaginated', () => {
  it('returns paginated ideas with correct shape', async () => {
    const { SupabaseIdeaRepository } = await import('./supabase-idea-repository')
    const repo = new SupabaseIdeaRepository()

    const now = new Date().toISOString()
    setupPaginatedChain({
      data: [
        {
          id: 'idea-1',
          name: 'Test Idea',
          description: 'A test idea',
          workspace_id: 'ws-1',
          product_id: null,
          created_by: 'user-1',
          graduated_feature_id: null,
          created_at: now,
          updated_at: now,
        },
      ],
      count: 1,
      error: null,
    })

    const result = await repo.findInboxPaginated('ws-1', { limit: 25, offset: 0 })

    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.items[0].id).toBe('idea-1')
    expect(result.items[0].name).toBe('Test Idea')
    expect(result.items[0].workspaceId).toBe('ws-1')
  })

  it('passes count option to select', async () => {
    const { SupabaseIdeaRepository } = await import('./supabase-idea-repository')
    const repo = new SupabaseIdeaRepository()

    setupPaginatedChain({ data: [], count: 0, error: null })

    await repo.findInboxPaginated('ws-1', { limit: 10, offset: 0 })

    expect(mockSelect).toHaveBeenCalledWith(
      expect.any(String),
      { count: 'exact' }
    )
  })

  it('returns empty result when no ideas match', async () => {
    const { SupabaseIdeaRepository } = await import('./supabase-idea-repository')
    const repo = new SupabaseIdeaRepository()

    setupPaginatedChain({ data: [], count: 0, error: null })

    const result = await repo.findInboxPaginated('ws-1', { limit: 25, offset: 0 })

    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
  })

  it('uses correct range for pagination', async () => {
    const { SupabaseIdeaRepository } = await import('./supabase-idea-repository')
    const repo = new SupabaseIdeaRepository()

    setupPaginatedChain({ data: [], count: 0, error: null })

    await repo.findInboxPaginated('ws-1', { limit: 10, offset: 20 })

    expect(mockRange).toHaveBeenCalledWith(20, 29)
  })

  it('throws on supabase error', async () => {
    const { SupabaseIdeaRepository } = await import('./supabase-idea-repository')
    const repo = new SupabaseIdeaRepository()

    setupPaginatedChain({ data: [], count: null, error: { message: 'DB error' } })

    await expect(repo.findInboxPaginated('ws-1', { limit: 25, offset: 0 }))
      .rejects.toThrow('Failed to fetch paginated inbox: DB error')
  })
})
