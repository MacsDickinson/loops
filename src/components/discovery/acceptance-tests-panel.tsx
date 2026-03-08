"use client"

import * as React from "react"
import { ExtractionIndicator } from "./extraction-indicator"

interface AcceptanceTest {
  id: string
  scenario: string
  given: string
  when: string
  then: string
}

interface AcceptanceTestsPanelProps {
  tests: AcceptanceTest[]
  isExtracting?: boolean
}

function TestStatus({ test }: { test: AcceptanceTest }) {
  const isReady = test.given && test.when && test.then
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
        isReady
          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
      }`}
    >
      {isReady ? "Ready" : "Draft"}
    </span>
  )
}

function TestItem({ test }: { test: AcceptanceTest }) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="animate-in fade-in slide-in-from-right-2 rounded-md border bg-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-2.5 text-left text-sm hover:bg-accent/50"
      >
        <span className="flex-1 font-medium">{test.scenario}</span>
        <div className="flex items-center gap-2">
          <TestStatus test={test} />
          <svg
            className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t px-3 py-2.5 font-mono text-xs">
          <div className="space-y-1">
            <div>
              <span className="font-semibold text-green-600 dark:text-green-400">Given </span>
              {test.given}
            </div>
            <div>
              <span className="font-semibold text-blue-600 dark:text-blue-400">When </span>
              {test.when}
            </div>
            <div>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Then </span>
              {test.then}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AcceptanceTestsPanel({ tests, isExtracting }: AcceptanceTestsPanelProps) {
  const readyCount = tests.filter((t) => t.given && t.when && t.then).length
  const progress = tests.length > 0 ? (readyCount / tests.length) * 100 : 0

  if (tests.length === 0 && !isExtracting) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <p>Acceptance tests will appear here as requirements are identified.</p>
      </div>
    )
  }

  if (tests.length === 0 && isExtracting) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <ExtractionIndicator />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {isExtracting && <ExtractionIndicator />}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Acceptance Tests
          </h3>
          <span className="text-xs text-muted-foreground">
            {readyCount}/{tests.length} ready
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-loop-discovery transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {tests.map((test) => (
          <TestItem key={test.id} test={test} />
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>BDD specs auto-generated from requirements</span>
        <button
          type="button"
          onClick={() => {
            const gherkin = tests
              .map(
                (t) =>
                  `Scenario: ${t.scenario}\n  Given ${t.given}\n  When ${t.when}\n  Then ${t.then}`
              )
              .join("\n\n")
            const blob = new Blob([gherkin], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "acceptance-tests.feature"
            a.click()
            setTimeout(() => {
              URL.revokeObjectURL(url)
            }, 0)
          }}
          className="font-medium hover:text-foreground"
        >
          Export Gherkin &rarr;
        </button>
      </div>
    </div>
  )
}
