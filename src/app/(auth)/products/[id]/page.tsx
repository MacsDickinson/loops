"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Detail</h1>
          <p className="text-sm text-muted-foreground">
            Product ID: {productId}
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="inline-flex items-center gap-2 rounded-lg bg-loop-discovery px-4 py-2 text-sm font-medium text-white hover:bg-loop-discovery/90"
        >
          Add Idea
        </Link>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">Loading...</Badge>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Product details will load once the workspace context is connected.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Ideas in Discovery</h2>
        <p className="text-sm text-muted-foreground">
          Ideas being explored for this product.
        </p>
        <div className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No ideas in discovery yet.
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Features</h2>
        <p className="text-sm text-muted-foreground">
          Graduated ideas organized by lifecycle stage.
        </p>
        <div className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No features yet. Ideas graduate to features once discovery is complete.
        </div>
      </div>
    </div>
  )
}
