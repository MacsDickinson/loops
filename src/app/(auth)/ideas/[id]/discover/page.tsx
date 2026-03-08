"use client"

import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Chat, type Message } from "@/components/ui/chat"
import { useDiscoveryChat } from "@/hooks/use-discovery-chat"
import { RequirementsPanel } from "@/components/discovery/requirements-panel"
import { AcceptanceTestsPanel } from "@/components/discovery/acceptance-tests-panel"

interface SessionData {
  id: string
  status: string
  startedAt: string
  personasUsed: string[]
}

interface Requirement {
  id: string
  text: string
  category: string
  priority: string
}

interface AcceptanceTest {
  id: string
  scenario: string
  given: string
  when: string
  then: string
}

interface SpecData {
  id: string
  title: string
  description: string
  requirements: Requirement[]
  acceptanceTests: AcceptanceTest[]
  status: string
}

interface IdeaData {
  idea: { id: string; name: string; description: string }
  specification: SpecData | null
  sessions: SessionData[]
}

interface DialogueTurn {
  id: string
  sessionId: string
  personaType: string
  question: string
  answer: string
  turnOrder: number
  createdAt: string
}

function turnsToMessages(turns: DialogueTurn[]): Message[] {
  const messages: Message[] = []
  for (const turn of turns) {
    messages.push({
      id: `turn-${turn.id}-q`,
      role: "user",
      content: turn.question,
      timestamp: new Date(turn.createdAt),
    })
    messages.push({
      id: `turn-${turn.id}-a`,
      role: "assistant",
      content: turn.answer,
      timestamp: new Date(turn.createdAt),
    })
  }
  return messages
}

async function loadTurnsForSession(sessionId: string): Promise<Message[]> {
  try {
    const res = await fetch(`/api/sessions/${sessionId}/turns`)
    if (res.ok) {
      const { turns } = await res.json()
      if (turns && turns.length > 0) {
        return turnsToMessages(turns)
      }
    }
  } catch (err) {
    console.error("[Discovery] Failed to load turns:", err)
  }
  return []
}

export default function DiscoverPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const ideaId = params.id as string
  const sessionIdParam = searchParams.get("sessionId")

  const [ideaData, setIdeaData] = React.useState<IdeaData | null>(null)
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(sessionIdParam)
  const [initialMessages, setInitialMessages] = React.useState<Message[] | undefined>(undefined)
  const [loading, setLoading] = React.useState(true)
  const [creatingSession, setCreatingSession] = React.useState(false)

  // Live spec state — updated after each turn via extraction
  const [spec, setSpec] = React.useState<SpecData | null>(null)

  const sessionId = activeSessionId ?? null
  const specificationId = ideaData?.specification?.id ?? null

  // Fetch updated spec from API
  const refreshSpec = React.useCallback(async () => {
    if (!specificationId) return
    try {
      const res = await fetch(`/api/specs/${specificationId}`)
      if (res.ok) {
        const data = await res.json()
        setSpec(data)
        // Also refresh idea data for title updates
        const ideaRes = await fetch(`/api/ideas/${ideaId}`)
        if (ideaRes.ok) {
          setIdeaData(await ideaRes.json())
        }
      }
    } catch (err) {
      console.error("[Discovery] Failed to refresh spec:", err)
    }
  }, [specificationId, ideaId])

  const {
    messages,
    isLoading: chatLoading,
    isExtracting,
    error,
    sendMessage,
    retryLastMessage,
  } = useDiscoveryChat({ sessionId, initialMessages, onSpecUpdated: refreshSpec })

  // Fetch idea details and existing turns on mount
  React.useEffect(() => {
    async function loadIdea() {
      try {
        const res = await fetch(`/api/ideas/${ideaId}`)
        if (res.ok) {
          const data: IdeaData = await res.json()
          setIdeaData(data)
          if (data.specification) {
            setSpec(data.specification)
          }

          // Determine which session to load
          const sessions = data.sessions ?? []
          const sid = sessionIdParam ?? sessions.find((s) => s.status === "active")?.id ?? sessions[0]?.id
          if (sid) {
            setActiveSessionId(sid)
            const msgs = await loadTurnsForSession(sid)
            if (msgs.length > 0) {
              setInitialMessages(msgs)
            }
          }
        }
      } catch (err) {
        console.error("[Discovery] Failed to load idea:", err)
      } finally {
        setLoading(false)
      }
    }
    loadIdea()
  }, [ideaId, sessionIdParam])

  const switchSession = React.useCallback(async (sid: string) => {
    setActiveSessionId(sid)
    const msgs = await loadTurnsForSession(sid)
    setInitialMessages(msgs.length > 0 ? msgs : undefined)
  }, [])

  const createNewSession = React.useCallback(async () => {
    if (creatingSession) return
    setCreatingSession(true)
    try {
      const res = await fetch(`/api/ideas/${ideaId}/sessions`, { method: "POST" })
      if (res.ok) {
        const { session } = await res.json()
        setActiveSessionId(session.id)
        setInitialMessages(undefined)
        const ideaRes = await fetch(`/api/ideas/${ideaId}`)
        if (ideaRes.ok) {
          setIdeaData(await ideaRes.json())
        }
      }
    } catch (err) {
      console.error("[Discovery] Failed to create session:", err)
    } finally {
      setCreatingSession(false)
    }
  }, [ideaId, creatingSession])

  const ideaTitle = ideaData?.idea?.name ?? "Untitled Idea"
  const requirements = spec?.requirements ?? []
  const acceptanceTests = spec?.acceptanceTests ?? []

  if (loading) {
    return (
      <div className="-m-6 flex h-[calc(100vh-56px)] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading discovery session...
        </div>
      </div>
    )
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-56px)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Idea
          </span>
          <h1 className="text-sm font-semibold">
            {ideaTitle === "Untitled Idea" ? "New Discovery" : ideaTitle}
          </h1>
          {ideaData && ideaData.sessions.length > 1 && (
            <select
              value={activeSessionId ?? ""}
              onChange={(e) => switchSession(e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-xs"
            >
              {ideaData.sessions.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.startedAt).toLocaleDateString()} — {s.status}
                  {idx === 0 ? " (latest)" : ""}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={createNewSession}
            disabled={creatingSession}
            className="rounded-md border px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
          >
            {creatingSession ? "Creating..." : "+ New Session"}
          </button>
        </div>

        {/* Loop navigation */}
        <div className="flex items-center gap-1">
          {[
            { label: "Discovery", active: true, color: "bg-loop-discovery text-white" },
            { label: "Build", active: false, color: "" },
            { label: "Operationalise", active: false, color: "" },
            { label: "Grow", active: false, color: "" },
          ].map((loop, idx) => (
            <React.Fragment key={loop.label}>
              {idx > 0 && <span className="text-xs text-muted-foreground">&rarr;</span>}
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                  loop.active
                    ? loop.color
                    : "text-muted-foreground"
                }`}
              >
                {loop.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground">
        <span>
          {requirements.length} requirement{requirements.length !== 1 ? "s" : ""} &middot;{" "}
          {acceptanceTests.length} acceptance test{acceptanceTests.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200">
          <strong>Error:</strong> {error.message}
          {error.retryable && (
            <button
              type="button"
              onClick={retryLastMessage}
              disabled={chatLoading}
              className="ml-2 rounded-md bg-red-900 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-800 disabled:opacity-60 dark:bg-red-300 dark:text-red-950"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Three-column layout */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-3">
        {/* Chat Panel */}
        <div className="flex flex-col overflow-hidden border-r">
          <Chat
            messages={messages}
            onSendMessage={sendMessage}
            isLoading={chatLoading}
            placeholder="Describe your feature or answer questions..."
          />
        </div>

        {/* Requirements Panel */}
        <div className="overflow-y-auto border-r">
          <RequirementsPanel requirements={requirements} isExtracting={isExtracting} />
        </div>

        {/* Acceptance Tests Panel */}
        <div className="overflow-y-auto">
          <AcceptanceTestsPanel tests={acceptanceTests} isExtracting={isExtracting} />
        </div>
      </div>
    </div>
  )
}
