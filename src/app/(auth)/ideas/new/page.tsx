"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useWorkspace } from "@/hooks/use-workspace"

export default function NewIdeaPage() {
  const router = useRouter()
  const { workspaceId, isLoading: workspaceLoading, error: workspaceError } = useWorkspace()
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !workspaceId) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Failed to create idea (${res.status})`)
      }

      const { idea, sessionId } = await res.json()
      router.push(`/ideas/${idea.id}/discover?sessionId=${sessionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create idea")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Idea</h1>
        <p className="text-sm text-muted-foreground">
          Describe your idea and start a discovery session to refine it.
        </p>
      </div>

      {(error || workspaceError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200">
          {error || `Workspace error: ${workspaceError}`}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Idea Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., User authentication with SSO"
            className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what you want to build..."
            rows={4}
            className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !name.trim() || workspaceLoading || !workspaceId}
            className="inline-flex items-center gap-2 rounded-lg bg-loop-discovery px-6 py-2.5 text-sm font-medium text-white hover:bg-loop-discovery/90 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Start Discovery"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
