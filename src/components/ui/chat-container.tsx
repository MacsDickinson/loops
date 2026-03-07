"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./card"
import { ChatMessage } from "./chat-message"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatContainerProps {
  messages: Message[]
  isLoading?: boolean
  className?: string
}

export function ChatContainer({ messages, isLoading, className }: ChatContainerProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  return (
    <Card className={cn("flex flex-col gap-0 p-0", className)}>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start a conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <ChatMessage
                role="assistant"
                content=""
                isLoading
              />
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </Card>
  )
}
