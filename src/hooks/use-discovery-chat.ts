"use client"

import * as React from "react"
import type { Message } from "@/components/ui/chat"

export type ChatError = {
  message: string
  retryable: boolean
}

export type SynthesizedSpec = {
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

class ChatRequestError extends Error {
  retryable: boolean
  constructor(message: string, retryable: boolean) {
    super(message)
    this.name = "ChatRequestError"
    this.retryable = retryable
  }
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm the Discovery Loop Coach. I'll help you turn your product ideas into precise, testable specifications.\n\nWhat feature would you like to work on today?",
  timestamp: new Date(Date.now() - 60000),
}

interface UseDiscoveryChatOptions {
  sessionId?: string | null
  personaType?: string
  initialMessages?: Message[]
  onSpecUpdated?: () => void
}

export function useDiscoveryChat(options: UseDiscoveryChatOptions = {}) {
  const { sessionId, personaType = "product_coach", initialMessages, onSpecUpdated } = options

  const [messages, setMessages] = React.useState<Message[]>(
    () => initialMessages && initialMessages.length > 0
      ? initialMessages
      : [WELCOME_MESSAGE]
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<ChatError | null>(null)
  const [lastUserMessage, setLastUserMessage] = React.useState<string | null>(null)
  const [synthesizedSpec, setSynthesizedSpec] = React.useState<SynthesizedSpec | null>(null)
  const [isSynthesizing, setIsSynthesizing] = React.useState(false)

  const prevSessionId = React.useRef(sessionId)

  // Reset messages when session changes or initialMessages arrives
  React.useEffect(() => {
    const sessionChanged = prevSessionId.current !== sessionId
    prevSessionId.current = sessionId

    if (sessionChanged) {
      setMessages(
        initialMessages && initialMessages.length > 0
          ? initialMessages
          : [WELCOME_MESSAGE]
      )
      setError(null)
      setSynthesizedSpec(null)
    } else if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages)
    }
  }, [sessionId, initialMessages])

  const sendMessage = React.useCallback(
    async (content: string, retry = false) => {
      setError(null)

      let conversationMessages = messages

      if (!retry) {
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            sessionId: sessionId ?? undefined,
            personaType,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new ChatRequestError(
            errorData.message || errorData.error || `Request failed (${response.status}). Please try again.`,
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

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk
          const capturedId = assistantId
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === capturedId
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          )
        }

        if (!accumulatedContent.trim()) {
          throw new ChatRequestError("AI returned an empty response. Please retry.", true)
        }

        // Notify that spec may have been updated (extraction runs server-side in onFinish)
        // Small delay to give the server time to complete extraction
        if (onSpecUpdated) {
          setTimeout(onSpecUpdated, 2000)
        }
      } catch (err: unknown) {
        const chatError: ChatError =
          err instanceof ChatRequestError
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
    },
    [messages, sessionId, personaType, onSpecUpdated]
  )

  const retryLastMessage = React.useCallback(async () => {
    if (!lastUserMessage || isLoading) return
    await sendMessage(lastUserMessage, true)
  }, [lastUserMessage, isLoading, sendMessage])

  const generateSpec = React.useCallback(
    async (specificationId?: string) => {
      if (messages.length < 3) return

      setIsSynthesizing(true)
      setError(null)

      try {
        const conversationMessages = messages
          .filter((msg) => msg.id !== "welcome")
          .map((msg) => ({ role: msg.role, content: msg.content }))

        const response = await fetch("/api/specs/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversationMessages,
            specificationId,
          }),
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
    },
    [messages]
  )

  return {
    messages,
    isLoading,
    error,
    synthesizedSpec,
    isSynthesizing,
    sendMessage,
    retryLastMessage,
    generateSpec,
    canGenerateSpec: messages.length >= 3,
  }
}
