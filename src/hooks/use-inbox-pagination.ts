"use client"

import * as React from "react"
import type { InboxIdea } from "@/components/inbox/inbox-list"

export const PAGE_SIZE = 25

export interface InboxPaginationState {
  ideas: InboxIdea[]
  loading: boolean
  hasMore: boolean
  error: string | null
}

export interface InboxPagination extends InboxPaginationState {
  loadMore: () => Promise<void>
}

export function buildInboxUrl(workspaceId: string, limit: number, offset: number): string {
  return `/api/workspaces/${workspaceId}/inbox?limit=${limit}&offset=${offset}`
}

export async function fetchNextPage(
  workspaceId: string,
  currentCount: number,
  fetchFn: typeof fetch = fetch,
  pageSize: number = PAGE_SIZE
): Promise<{ ideas: InboxIdea[]; error: string | null }> {
  try {
    const url = buildInboxUrl(workspaceId, pageSize, currentCount)
    const res = await fetchFn(url)
    if (!res.ok) {
      return { ideas: [], error: `Request failed (${res.status})` }
    }
    const data = await res.json()
    return { ideas: data.ideas ?? [], error: null }
  } catch (err) {
    return {
      ideas: [],
      error: err instanceof Error ? err.message : "Failed to load more ideas",
    }
  }
}

export function useInboxPagination(
  initialIdeas: InboxIdea[],
  total: number,
  workspaceId: string,
  pageSize: number = PAGE_SIZE
): InboxPagination {
  const [ideas, setIdeas] = React.useState<InboxIdea[]>(initialIdeas)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const hasMore = ideas.length < total

  const loadMore = React.useCallback(async () => {
    if (!hasMore || loading) return
    setLoading(true)
    setError(null)

    const result = await fetchNextPage(workspaceId, ideas.length, fetch, pageSize)
    if (result.error) {
      setError(result.error)
    } else {
      setIdeas((prev) => [...prev, ...result.ideas])
    }
    setLoading(false)
  }, [workspaceId, ideas.length, hasMore, loading, pageSize])

  return { ideas, loading, hasMore, error, loadMore }
}
