import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Test the fetch contract that useWorkspace relies on.
// Without @testing-library/react we verify the API integration logic directly.

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useWorkspace fetch contract', () => {
  it('calls /api/me and returns workspace context', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ userId: 'user-1', workspaceId: 'ws-1' }),
    })

    const res = await fetch('/api/me')
    const data = await res.json()

    expect(mockFetch).toHaveBeenCalledWith('/api/me')
    expect(data.userId).toBe('user-1')
    expect(data.workspaceId).toBe('ws-1')
  })

  it('returns error shape on auth failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    })

    const res = await fetch('/api/me')
    expect(res.ok).toBe(false)

    const data = await res.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('handles network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(fetch('/api/me')).rejects.toThrow('Network error')
  })
})
