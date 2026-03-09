"use client"

import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Chat } from "@/components/ui/chat"
import { useDiscoveryChat, type SynthesizedSpec } from "@/hooks/use-discovery-chat"

interface IdeaData {
  idea: { id: string; name: string; description: string }
  specification: { id: string } | null
  session: { id: string } | null
}

function specToMarkdown(spec: SynthesizedSpec): string {
  const lines: string[] = []
  lines.push(`# ${spec.title}`)
  lines.push("")
  lines.push(`> ${spec.requirements.length} requirements | ${spec.acceptanceTests.length} acceptance tests | ${spec.metadata.dialogueTurnCount} dialogue turns`)
  lines.push("")

  if (spec.requirements.length > 0) {
    lines.push("## Requirements")
    lines.push("")
    for (const req of spec.requirements) {
      lines.push(`- **[${req.priority}]** ${req.text}`)
    }
    lines.push("")
  }

  if (spec.acceptanceTests.length > 0) {
    lines.push("## Acceptance Tests")
    lines.push("")
    for (const test of spec.acceptanceTests) {
      lines.push(`### ${test.scenario}`)
      lines.push("")
      lines.push(`- **Given** ${test.given}`)
      lines.push(`- **When** ${test.when}`)
      lines.push(`- **Then** ${test.then}`)
      lines.push("")
    }
  }

  return lines.join("\n")
}

function SpecPreview({ spec }: { spec: SynthesizedSpec }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 text-xl font-bold">{spec.title}</h3>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{spec.requirements.length} requirements</span>
          <span>&middot;</span>
          <span>{spec.acceptanceTests.length} tests</span>
          <span>&middot;</span>
          <span>{spec.metadata.dialogueTurnCount} dialogue turns</span>
        </div>
      </div>

      {spec.requirements.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="mb-3 font-semibold">Requirements</h4>
          <ul className="space-y-2">
            {spec.requirements.map((req, idx) => (
              <li key={idx} className="text-sm">
                <span className="font-medium text-muted-foreground">
                  [{req.priority}]
                </span>{" "}
                {req.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {spec.acceptanceTests.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="mb-3 font-semibold">Acceptance Tests (BDD)</h4>
          <div className="space-y-3">
            {spec.acceptanceTests.map((test, idx) => (
              <div key={idx} className="text-sm">
                <p className="mb-1 font-medium">{test.scenario}</p>
                <div className="rounded bg-muted p-2 font-mono text-xs">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">Given</span>{" "}
                    {test.given}
                  </div>
                  <div>
                    <span className="text-green-600 dark:text-green-400">When</span>{" "}
                    {test.when}
                  </div>
                  <div>
                    <span className="text-purple-600 dark:text-purple-400">Then</span>{" "}
                    {test.then}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Actions */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="mb-3 font-semibold">Export Options</h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const markdown = specToMarkdown(spec)
              const blob = new Blob([markdown], { type: "text/markdown" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `${spec.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.md`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Download Markdown
          </button>
          <button
            type="button"
            onClick={async () => {
              const markdown = specToMarkdown(spec)
              await navigator.clipboard.writeText(markdown)
            }}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const ideaId = params.id as string
  const sessionIdParam = searchParams.get("sessionId")

  const [ideaData, setIdeaData] = React.useState<IdeaData | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Determine session ID from query param or fetched data
  const sessionId = sessionIdParam ?? ideaData?.session?.id ?? null
  const specificationId = ideaData?.specification?.id ?? null

  const {
    messages,
    isLoading: chatLoading,
    error,
    synthesizedSpec,
    isSynthesizing,
    sendMessage,
    retryLastMessage,
    generateSpec,
    canGenerateSpec,
  } = useDiscoveryChat({ sessionId })

  // Fetch idea details on mount
  React.useEffect(() => {
    async function loadIdea() {
      try {
        const res = await fetch(`/api/ideas/${ideaId}`)
        if (res.ok) {
          const data = await res.json()
          setIdeaData(data)
        }
      } catch (err) {
        console.error("[Discovery] Failed to load idea:", err)
      } finally {
        setLoading(false)
      }
    }
    loadIdea()
  }, [ideaId])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discovery Session</h1>
        <p className="text-sm text-muted-foreground">
          {ideaData?.idea?.name ?? `Idea: ${ideaId}`}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200">
          <p>
            <strong>Error:</strong> {error.message}
          </p>
          {error.retryable && (
            <button
              type="button"
              onClick={retryLastMessage}
              disabled={chatLoading}
              className="mt-2 rounded-md bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800 disabled:opacity-60 dark:bg-red-300 dark:text-red-950"
            >
              Retry last message
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chat Panel */}
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Discovery Dialogue</h2>
            <button
              type="button"
              onClick={() => generateSpec(specificationId ?? undefined)}
              disabled={isSynthesizing || chatLoading || !canGenerateSpec}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSynthesizing ? "Generating..." : "Generate Specification"}
            </button>
          </div>

          <div className="h-[calc(100vh-320px)] overflow-hidden rounded-lg border">
            <Chat
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={chatLoading}
              placeholder="Describe your feature idea..."
            />
          </div>
        </div>

        {/* Spec Preview Panel */}
        <div className="flex flex-col">
          <h2 className="mb-4 text-lg font-semibold">Specification Preview</h2>

          {!synthesizedSpec ? (
            <div className="flex h-[calc(100vh-320px)] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Have a conversation with the Discovery Coach,
                </p>
                <p className="text-sm text-muted-foreground">
                  then click &ldquo;Generate Specification&rdquo; to see results here.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-320px)] overflow-y-auto">
              <SpecPreview spec={synthesizedSpec} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
