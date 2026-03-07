"use client"

import * as React from "react"
import { Chat, type Message } from "@/components/ui/chat"
import Link from "next/link"

type ChatError = {
  message: string
  retryable: boolean
}

type SynthesizedSpec = {
  title: string
  requirements: Array<{
    text: string
    category: string
    priority: string
  }>
  acceptanceTests: Array<{
    scenario: string
    given: string
    when: string
    then: string
  }>
  metadata: {
    dialogueTurnCount: number
    personasUsed: string[]
  }
  reasoning?: {
    requirements?: string
    tests?: string
  }
}

type SendOptions = {
  retry?: boolean
}

class ChatRequestError extends Error {
  retryable: boolean

  constructor(message: string, retryable: boolean) {
    super(message)
    this.name = "ChatRequestError"
    this.retryable = retryable
  }
}

export default function ChatDemoPage() {
  const [messages, setMessages] = React.useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm the Discovery Loop Coach. I'll help you turn your product ideas into precise, testable specifications.\n\nWhat feature would you like to work on today?",
      timestamp: new Date(Date.now() - 60000),
    },
  ])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<ChatError | null>(null)
  const [lastUserMessage, setLastUserMessage] = React.useState<string | null>(null)
  const [synthesizedSpec, setSynthesizedSpec] = React.useState<SynthesizedSpec | null>(null)
  const [isSynthesizing, setIsSynthesizing] = React.useState(false)

  const handleSendMessage = async (content: string, options?: SendOptions) => {
    const isRetry = options?.retry ?? false
    setError(null)

    let conversationMessages = messages

    if (!isRetry) {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setLastUserMessage(content)
      conversationMessages = [...messages, userMessage]
    }

    setIsLoading(true)
    let assistantId: string | null = null

    try {
      const apiMessages = conversationMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch("/api/discovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const fallbackMessage = `Request failed (${response.status}). Please try again.`

        throw new ChatRequestError(
          errorData.message || errorData.error || fallbackMessage,
          Boolean(errorData.retryable) || response.status >= 500
        )
      }

      assistantId = crypto.randomUUID()
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      const reader = response.body?.getReader()
      if (!reader) {
        throw new ChatRequestError("Response stream is unavailable.", true)
      }

      const decoder = new TextDecoder()
      let accumulatedContent = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("0:")) {
            continue
          }

          const payload = line.slice(2).trim()
          if (!payload) {
            continue
          }

          try {
            const parsed = JSON.parse(payload)
            if (typeof parsed !== "string") {
              continue
            }

            accumulatedContent += parsed
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? {
                      ...msg,
                      content: accumulatedContent,
                    }
                  : msg
              )
            )
          } catch {
            // Skip malformed partial chunks.
          }
        }
      }

      if (!accumulatedContent.trim()) {
        throw new ChatRequestError("AI returned an empty response. Please retry.", true)
      }
    } catch (err: unknown) {
      const chatError: ChatError = err instanceof ChatRequestError
        ? { message: err.message, retryable: err.retryable }
        : err instanceof Error
          ? { message: err.message, retryable: true }
          : { message: "An unexpected error occurred.", retryable: true }

      setError(chatError)
      console.error("[Chat] Error", err)
      if (assistantId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantId))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async () => {
    if (!lastUserMessage || isLoading) {
      return
    }

    await handleSendMessage(lastUserMessage, { retry: true })
  }

  const handleGenerateSpec = async () => {
    if (messages.length < 3) {
      alert("Please have a conversation first before generating a specification.")
      return
    }

    setIsSynthesizing(true)
    setError(null)

    try {
      // Filter out welcome message and format for API
      const conversationMessages = messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      const response = await fetch("/api/specs/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: conversationMessages }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || errorData.error || "Failed to generate specification"
        )
      }

      const spec = await response.json()
      setSynthesizedSpec(spec)
    } catch (err) {
      console.error("[Generate Spec] Error", err)
      setError({
        message: err instanceof Error ? err.message : "Failed to generate specification",
        retryable: true,
      })
    } finally {
      setIsSynthesizing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-semibold text-black hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
          >
            Discovery Loop Coach
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-black dark:text-zinc-50">
            Discovery Session
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            AI-guided conversation to turn your ideas into precise specifications
          </p>
          {error && (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200">
              <p>
                <strong>Error:</strong> {error.message}
              </p>
              {error.retryable && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isLoading || !lastUserMessage}
                  className="mt-2 rounded-md bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-300 dark:text-red-950 dark:hover:bg-red-200"
                >
                  Retry last message
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chat Panel */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                Discovery Dialogue
              </h2>
              <button
                type="button"
                onClick={handleGenerateSpec}
                disabled={isSynthesizing || isLoading || messages.length < 3}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {isSynthesizing ? "Generating..." : "Generate Specification"}
              </button>
            </div>

            <div className="h-[calc(100vh-320px)] overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <Chat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="Describe your feature idea..."
              />
            </div>
          </div>

          {/* Spec Preview Panel */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-lg font-semibold text-black dark:text-zinc-50">
              Specification Preview
            </h2>

            {!synthesizedSpec ? (
              <div className="flex h-[calc(100vh-320px)] items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Have a conversation with the Discovery Coach,
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    then click &ldquo;Generate Specification&rdquo; to see results here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[calc(100vh-320px)] space-y-4 overflow-y-auto">
                {/* Title and Summary */}
                <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-2 text-xl font-bold text-black dark:text-zinc-50">
                    {synthesizedSpec.title}
                  </h3>
                  <div className="flex gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <span>
                      {synthesizedSpec.requirements.length} requirements
                    </span>
                    <span>•</span>
                    <span>
                      {synthesizedSpec.acceptanceTests.length} tests
                    </span>
                    <span>•</span>
                    <span>
                      {synthesizedSpec.metadata.dialogueTurnCount} dialogue turns
                    </span>
                  </div>
                </div>

                {/* Requirements */}
                {synthesizedSpec.requirements.length > 0 && (
                  <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <h4 className="mb-3 font-semibold text-black dark:text-zinc-50">
                      Requirements
                    </h4>
                    <ul className="space-y-2">
                      {synthesizedSpec.requirements.map((req, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-zinc-800 dark:text-zinc-200"
                        >
                          <span className="font-medium text-zinc-600 dark:text-zinc-400">
                            [{req.priority}]
                          </span>{" "}
                          {req.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Acceptance Tests */}
                {synthesizedSpec.acceptanceTests.length > 0 && (
                  <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <h4 className="mb-3 font-semibold text-black dark:text-zinc-50">
                      Acceptance Tests (BDD)
                    </h4>
                    <div className="space-y-3">
                      {synthesizedSpec.acceptanceTests.map((test, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">
                            {test.scenario}
                          </p>
                          <div className="rounded bg-zinc-50 p-2 font-mono text-xs text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                            <div>
                              <span className="text-blue-600 dark:text-blue-400">
                                Given
                              </span>{" "}
                              {test.given}
                            </div>
                            <div>
                              <span className="text-green-600 dark:text-green-400">
                                When
                              </span>{" "}
                              {test.when}
                            </div>
                            <div>
                              <span className="text-purple-600 dark:text-purple-400">
                                Then
                              </span>{" "}
                              {test.then}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Export Actions */}
                <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <h4 className="mb-3 font-semibold text-black dark:text-zinc-50">
                    Export Options
                  </h4>
                  <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                    Export your specification as Markdown or copy to clipboard.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // TODO: Implement download
                        alert("Download will be implemented with full Specification schema")
                      }}
                      className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                      Download Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // TODO: Implement copy
                        alert("Copy will be implemented with full Specification schema")
                      }}
                      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
