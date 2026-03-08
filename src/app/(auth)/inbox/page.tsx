"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface Idea {
  id: string
  name: string
  description: string
  createdAt: string
  graduatedFeatureId: string | null
}

export default function InboxPage() {
  const [ideas] = React.useState<Idea[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // TODO: Fetch inbox ideas from API once workspace context is available
    setLoading(false)
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Unassigned ideas waiting to be explored or assigned to a product.
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="inline-flex items-center gap-2 rounded-lg bg-loop-discovery px-4 py-2 text-sm font-medium text-white hover:bg-loop-discovery/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          New Idea
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
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
      ) : (
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
        </div>
      )}
    </div>
  )
}
