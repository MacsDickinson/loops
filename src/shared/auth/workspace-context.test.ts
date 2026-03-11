import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockLimit = vi.fn()

vi.mock('@/shared/infrastructure/supabase/server', () => ({
  supabaseServer: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

vi.mock('./require-auth', () => ({
  requireAuth: vi.fn(),
}))

function setupChain(result: { data: unknown; error: unknown }) {
  mockFrom.mockReturnValue({ select: mockSelect })
  mockSelect.mockReturnValue({ eq: mockEq })
  mockEq.mockImplementation(() => ({
    eq: mockEq,
    single: mockSingle,
    limit: mockLimit,
  }))
  mockLimit.mockReturnValue({ single: mockSingle })
  mockSingle.mockResolvedValue(result)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('findWorkspaceMembership', () => {
  it('returns userId and role for a valid membership', async () => {
    const { findWorkspaceMembership } = await import('./workspace-context')

    setupChain({
      data: { user_id: 'db-user-1', role: 'admin', users: { clerk_user_id: 'clerk-1' } },
      error: null,
    })

    const result = await findWorkspaceMembership('clerk-1', 'ws-1')

    expect(result).toEqual({ userId: 'db-user-1', role: 'admin' })
    expect(mockFrom).toHaveBeenCalledWith('memberships')
  })

  it('returns null when membership not found', async () => {
    const { findWorkspaceMembership } = await import('./workspace-context')

    setupChain({ data: null, error: { message: 'not found' } })

    const result = await findWorkspaceMembership('clerk-1', 'ws-1')

    expect(result).toBeNull()
  })
})

describe('getDefaultWorkspace', () => {
  it('returns workspace context for owner membership', async () => {
    const { getDefaultWorkspace } = await import('./workspace-context')

    setupChain({
      data: {
        user_id: 'db-user-1',
        workspace_id: 'ws-1',
        role: 'owner',
        users: { clerk_user_id: 'clerk-1' },
      },
      error: null,
    })

    const result = await getDefaultWorkspace('clerk-1')

    expect(result).toEqual({
      userId: 'db-user-1',
      workspaceId: 'ws-1',
      role: 'owner',
    })
  })

  it('returns null when no owner membership exists', async () => {
    const { getDefaultWorkspace } = await import('./workspace-context')

    setupChain({ data: null, error: { message: 'not found' } })

    const result = await getDefaultWorkspace('clerk-1')

    expect(result).toBeNull()
  })
})

describe('getDefaultWorkspaceId', () => {
  it('returns workspace ID from getDefaultWorkspace', async () => {
    const { getDefaultWorkspaceId } = await import('./workspace-context')

    setupChain({
      data: {
        user_id: 'db-user-1',
        workspace_id: 'ws-1',
        role: 'owner',
        users: { clerk_user_id: 'clerk-1' },
      },
      error: null,
    })

    const result = await getDefaultWorkspaceId('clerk-1')

    expect(result).toBe('ws-1')
  })

  it('returns null when no workspace found', async () => {
    const { getDefaultWorkspaceId } = await import('./workspace-context')

    setupChain({ data: null, error: { message: 'not found' } })

    const result = await getDefaultWorkspaceId('clerk-1')

    expect(result).toBeNull()
  })
})

describe('requireWorkspaceAccess', () => {
  it('returns 403 NextResponse for non-member', async () => {
    const { requireAuth } = await import('./require-auth')
    const { requireWorkspaceAccess } = await import('./workspace-context')

    vi.mocked(requireAuth).mockResolvedValue({
      clerkUserId: 'clerk-1',
      email: 'test@example.com',
      name: 'Test User',
    })

    setupChain({ data: null, error: { message: 'not found' } })

    const result = await requireWorkspaceAccess('ws-1')

    // NextResponse check
    expect(result).toHaveProperty('status', 403)
  })
})
