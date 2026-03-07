"use client"

import * as React from "react"
import { Chat, type Message } from "@/components/ui/chat"
import Link from "next/link"

export default function ChatDemoPage() {
  const [messages, setMessages] = React.useState<Message[]>(() => [
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm the Discovery Loop Coach. I'll help you turn your product ideas into precise, testable specifications.\n\nWhat feature would you like to work on today?",
      timestamp: new Date(Date.now() - 60000),
    },
  ])
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response
    setIsLoading(true)
    setTimeout(() => {
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: generateMockResponse(content),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateMockResponse = (userInput: string): string => {
    // Mock responses for demo
    const responses = [
      `Great! Let's break that down. I have a few clarifying questions:\n\n1. **User Journey**: Who are the primary users for this feature?\n2. **Edge Cases**: What should happen if the user's input is invalid?\n3. **Success Criteria**: How will we know this feature is working correctly?\n\nLet's start with the first question - who are your primary users?`,
      `Interesting! Here's what I understand so far:\n\n**Feature Overview**\n${userInput}\n\n**Questions to Refine**:\n- What's the expected response time?\n- Should this work offline?\n- Are there any accessibility requirements?\n\nWould you like me to activate the **Security Persona** to review potential vulnerabilities?`,
      `Perfect! Based on our conversation, here's a draft specification:\n\n## Acceptance Criteria\n\n\`\`\`gherkin\nGiven a user is on the feature page\nWhen they complete the required fields\nThen they should see a confirmation message\n  And the data should be saved to the database\n\`\`\`\n\nDoes this capture what you need?`,
    ]
    return responses[Math.floor(Math.random() * responses.length)]
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
            Chat Interface Demo
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Interactive prototype of the Discovery Loop conversational interface
          </p>
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
