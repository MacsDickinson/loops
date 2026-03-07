"use client"

import * as React from "react"
import { ChatContainer, type Message } from "./chat-container"
import { ChatInput } from "./chat-input"
import { cn } from "@/lib/utils"

interface ChatProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
  className?: string
  placeholder?: string
}

export function Chat({ messages, onSendMessage, isLoading, className, placeholder }: ChatProps) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      <div className="flex-1 overflow-hidden">
        <ChatContainer messages={messages} isLoading={isLoading} className="h-full" />
      </div>
      <ChatInput
        onSend={onSendMessage}
        disabled={isLoading}
        placeholder={placeholder}
        className="border-t bg-background"
      />
    </div>
  )
}

export type { Message }
