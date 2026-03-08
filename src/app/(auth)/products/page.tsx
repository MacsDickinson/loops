"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  description: string
  lifecycleStage: string
}

const stageBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  idea: "outline",
  pilot: "secondary",
  incubating: "secondary",
  graduating: "secondary",
  growth: "default",
  sunset: "destructive",
}

export default function ProductsPage() {
  const [products] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // TODO: Fetch products from API once workspace context is available
    setLoading(false)
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Your products and their lifecycle stages.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          New Product
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M16.5 9.4 7.55 4.24" />
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" x2="12" y1="22.08" y2="12" />
            </svg>
          </div>
          <h3 className="mt-4 font-semibold">No products yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Products are created when ideas graduate from discovery.
          </p>
          <Link
            href="/ideas/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-loop-discovery px-4 py-2 text-sm font-medium text-white hover:bg-loop-discovery/90"
          >
            Start with an Idea
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                  {product.description}
                </p>
              </div>
              <Badge variant={stageBadgeVariant[product.lifecycleStage] || "secondary"}>
                {product.lifecycleStage}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
