"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function NewIdeaPage() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    // TODO: Call POST /api/workspaces/{id}/ideas once workspace context is available
    // For now, redirect to the chat-demo page
    router.push("/chat-demo")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Idea</h1>
        <p className="text-sm text-muted-foreground">
          Describe your idea and start a discovery session to refine it.
        </p>
      </div>

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
            disabled={submitting || !name.trim()}
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
