"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  persona?: string
  isLoading?: boolean
}

const PERSONA_LABELS: Record<string, string> = {
  product_agent: "Product Agent",
  security_expert: "Security Expert",
  ux_analyst: "UX Analyst",
  domain_expert: "Domain Expert",
}

export function ChatMessage({ role, content, timestamp, persona, isLoading }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground ring-1 ring-border"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
          </div>
        ) : (
          <>
            {isUser ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children, className }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="rounded bg-muted-foreground/10 px-1.5 py-0.5 font-mono text-xs">
                          {children}
                        </code>
                      ) : (
                        <code className={cn("block rounded-lg bg-muted p-3 font-mono text-xs", className)}>
                          {children}
                        </code>
                      )
                    },
                    pre: ({ children }) => <pre className="mb-2 overflow-x-auto">{children}</pre>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
            {(timestamp || persona) && (
              <span className="text-xs opacity-60">
                {persona && !isUser && (
                  <span className="font-medium">{PERSONA_LABELS[persona] ?? persona}</span>
                )}
                {persona && !isUser && timestamp && " · "}
                {timestamp && timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
