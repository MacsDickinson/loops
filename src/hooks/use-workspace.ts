"use client"

import * as React from "react"

interface WorkspaceContext {
  workspaceId: string | null
  userId: string | null
  isLoading: boolean
  error: string | null
}

export function useWorkspace(): WorkspaceContext {
  const [state, setState] = React.useState<WorkspaceContext>({
    workspaceId: null,
    userId: null,
    isLoading: true,
    error: null,
  })

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/me")
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          if (!cancelled) {
            setState({
              workspaceId: null,
              userId: null,
              isLoading: false,
              error: data.error || `Request failed (${res.status})`,
            })
          }
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setState({
            workspaceId: data.workspaceId,
            userId: data.userId,
            isLoading: false,
            error: null,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            workspaceId: null,
            userId: null,
            isLoading: false,
            error: err instanceof Error ? err.message : "Failed to load workspace",
          })
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return state
}
