"use client"

import * as React from "react"
import { useParams } from "next/navigation"

export default function DiscoverPage() {
  const params = useParams()
  const ideaId = params.id as string

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discovery Session</h1>
        <p className="text-sm text-muted-foreground">
          Idea: {ideaId}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col">
          <h2 className="mb-4 text-lg font-semibold">Discovery Dialogue</h2>
          <div className="flex h-[calc(100vh-280px)] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              Discovery chat will be integrated here.
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <h2 className="mb-4 text-lg font-semibold">Specification Preview</h2>
          <div className="flex h-[calc(100vh-280px)] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Have a conversation with the Discovery Coach,
              </p>
              <p className="text-sm text-muted-foreground">
                then generate a specification to see results here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
