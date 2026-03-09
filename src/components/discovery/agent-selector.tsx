"use client"

import * as React from "react"
import { AGENT_CATALOG } from "@/contexts/discovery/domain/value-objects/agent-catalog"
import type { PersonaType } from "@/contexts/discovery/domain/value-objects/persona-type"

interface AgentSelectorProps {
  onSelect: (agentType: PersonaType) => void
  onClose: () => void
}

const AGENT_ICONS: Record<string, string> = {
  product_agent: "P",
  security_expert: "S",
  ux_analyst: "U",
  domain_expert: "D",
  architecture_expert: "A",
}

const AGENT_COLORS: Record<string, string> = {
  product_agent: "bg-blue-500",
  security_expert: "bg-red-500",
  ux_analyst: "bg-purple-500",
  domain_expert: "bg-amber-500",
  architecture_expert: "bg-emerald-500",
}

export function AgentSelector({ onSelect, onClose }: AgentSelectorProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border bg-background p-2 shadow-lg"
    >
      <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
        Choose an agent for this session
      </p>
      {AGENT_CATALOG.map((agent) => (
        <button
          key={agent.type}
          type="button"
          onClick={() => onSelect(agent.type)}
          className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${AGENT_COLORS[agent.type] ?? "bg-gray-500"}`}
          >
            {AGENT_ICONS[agent.type] ?? "?"}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{agent.name}</span>
              {agent.role === "coach" && (
                <span className="rounded bg-blue-100 px-1 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  Coach
                </span>
              )}
              {agent.role === "specialist" && (
                <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Specialist
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {agent.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
