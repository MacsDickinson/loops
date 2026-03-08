"use client"

import * as React from "react"
import { ExtractionIndicator } from "./extraction-indicator"

interface Requirement {
  id: string
  text: string
  category: string
  priority: string
}

interface RequirementsPanelProps {
  requirements: Requirement[]
  isExtracting?: boolean
}

const CATEGORY_SECTIONS: Record<string, { label: string; badge: string }> = {
  functional: { label: "Overview", badge: "Discovery" },
  ux: { label: "User Journey", badge: "Discovery" },
  security: { label: "Security Requirements", badge: "Discovery" },
  performance: { label: "Production Requirements", badge: "Production" },
  non_functional: { label: "Production Requirements", badge: "Production" },
  business_rule: { label: "Business Rules", badge: "Discovery" },
}

function groupByCategory(requirements: Requirement[]) {
  const groups = new Map<string, Requirement[]>()
  for (const req of requirements) {
    const key = req.category
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(req)
  }
  return groups
}

function BadgeLabel({ text, variant }: { text: string; variant: "discovery" | "production" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
        variant === "discovery"
          ? "bg-loop-discovery-subtle text-loop-discovery border border-loop-discovery-border"
          : "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
      }`}
    >
      {text}
    </span>
  )
}

export function RequirementsPanel({ requirements, isExtracting }: RequirementsPanelProps) {
  const groups = groupByCategory(requirements)

  if (requirements.length === 0 && !isExtracting) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <p>Requirements will appear here as you discuss your idea.</p>
      </div>
    )
  }

  if (requirements.length === 0 && isExtracting) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <ExtractionIndicator />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Requirements
      </h3>
      {isExtracting && <ExtractionIndicator />}
      {Array.from(groups.entries()).map(([category, reqs]) => {
        const section = CATEGORY_SECTIONS[category] ?? { label: category, badge: "Discovery" }
        return (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">{section.label}</h4>
              <BadgeLabel
                text={section.badge}
                variant={section.badge === "Production" ? "production" : "discovery"}
              />
            </div>
            <ul className="space-y-1.5">
              {reqs.map((req) => (
                <li
                  key={req.id}
                  className="animate-in fade-in slide-in-from-left-2 rounded-md border bg-card p-2.5 text-sm"
                >
                  {req.text}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
