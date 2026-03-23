"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export interface InboxIdea {
  id: string
  name: string
  description: string
  createdAt: string
  graduatedFeatureId: string | null
}

interface InboxListProps {
  initialIdeas: InboxIdea[]
  total: number
  workspaceId: string
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 25

export function InboxList({
  initialIdeas,
  total,
  workspaceId,
  pageSize,
}: InboxListProps) {
  const [ideas, setIdeas] = React.useState<InboxIdea[]>(initialIdeas)
  const [loading, setLoading] = React.useState(false)

  const hasMore = ideas.length < total
  const effectivePageSize = pageSize ?? DEFAULT_PAGE_SIZE

  async function loadMore() {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/inbox?limit=${effectivePageSize}&offset=${ideas.length}`
      )
      if (res.ok) {
        const data = await res.json()
        setIdeas((prev) => [...prev, ...(data.ideas ?? [])])
      }
    } catch (err) {
      console.error("[Inbox] Failed to load more ideas:", err)
    } finally {
      setLoading(false)
    }
  }

  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        </div>
        <h3 className="mt-4 font-semibold">No ideas yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first idea to start the discovery process.
        </p>
        <Link
          href="/ideas/new"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create an Idea
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {ideas.map((idea) => (
        <Link
          key={idea.id}
          href={`/ideas/${idea.id}/discover`}
          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <div>
            <p className="font-medium">{idea.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {idea.description}
            </p>
          </div>
          <Badge variant="secondary">
            {idea.graduatedFeatureId ? "Graduated" : "New"}
          </Badge>
        </Link>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full rounded-lg border p-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  )
}
