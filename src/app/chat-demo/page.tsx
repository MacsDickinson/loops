"use client"

import * as React from "react"
import { Chat, type Message } from "@/components/ui/chat"
import Link from "next/link"

export default function ChatDemoPage() {
  const [messages, setMessages] = React.useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm the Discovery Loop Coach. I'll help you turn your product ideas into precise, testable specifications.\n\nWhat feature would you like to work on today?",
      timestamp: new Date(Date.now() - 60000),
    },
  ])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSendMessage = async (content: string) => {
    // Clear any previous errors
    setError(null)

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Start loading
    setIsLoading(true)

    try {
      // Prepare messages for API (exclude timestamps and ids)
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Call Discovery API with streaming
      const response = await fetch("/api/discovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
        }),
      })

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || errorData.error || `API error: ${response.status}`
        )
      }

      // Create assistant message for streaming response
      const assistantId = crypto.randomUUID()
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Process streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("Response body is not readable")
      }

      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true })

        // Parse data stream format (lines starting with "0:" contain text)
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("0:")) {
            // Extract JSON from the data line
            const jsonStr = line.slice(2).trim()
            if (jsonStr) {
              try {
                const parsed = JSON.parse(jsonStr)
                if (typeof parsed === "string") {
                  accumulatedContent += parsed
                  // Update message in real-time
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  )
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      console.error("[Chat] Error:", err)

      // Remove the empty assistant message if streaming failed
      setMessages((prev) => prev.filter((msg) => msg.content !== ""))
    } finally {
      setIsLoading(false)
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
            <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="h-[calc(100vh-220px)] overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Describe your feature idea..."
          />
        </div>
      </main>
    </div>
  )
}
