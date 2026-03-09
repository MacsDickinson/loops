"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function FeatureDetailPage() {
  const params = useParams()
  const featureId = params.id as string

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feature Detail</h1>
        <p className="text-sm text-muted-foreground">
          Feature ID: {featureId}
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">Pilot</Badge>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Feature details will load once the workspace context is connected.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Specification</h2>
        <div className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Specification content will appear here.
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Change History</h2>
        <div className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Specification changelog will appear here.
        </div>
      </div>
    </div>
  )
}
