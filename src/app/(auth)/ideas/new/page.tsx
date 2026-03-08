"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/hooks/use-workspace"

export default function NewIdeaPage() {
  const router = useRouter()
  const { workspaceId, isLoading: workspaceLoading, error: workspaceError } = useWorkspace()
  const [error, setError] = React.useState<string | null>(null)
  const hasCreated = React.useRef(false)

  React.useEffect(() => {
    if (workspaceLoading || !workspaceId || hasCreated.current) return
    hasCreated.current = true

    async function createAndRedirect() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/ideas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Untitled Idea", description: "" }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message || `Failed to create idea (${res.status})`)
        }

        const { idea, sessionId } = await res.json()
        router.replace(`/ideas/${idea.id}/discover?sessionId=${sessionId}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create idea")
        hasCreated.current = false
      }
    }

    createAndRedirect()
  }, [workspaceId, workspaceLoading, router])

  if (error || workspaceError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200">
            {error || `Workspace error: ${workspaceError}`}
          </div>
          <button
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Setting up your discovery session...
      </div>
    </div>
  )
}
