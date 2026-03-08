"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ExtractionIndicator } from "./extraction-indicator"

interface PrdPanelProps {
  content: string
  specificationId: string | null
  isExtracting?: boolean
  onContentSaved?: (content: string) => void
}

export function PrdPanel({ content, specificationId, isExtracting, onContentSaved }: PrdPanelProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editContent, setEditContent] = React.useState(content)
  const [isSaving, setIsSaving] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Sync edit buffer when content changes externally (e.g. after extraction)
  React.useEffect(() => {
    if (!isEditing) {
      setEditContent(content)
    }
  }, [content, isEditing])

  // Auto-focus and auto-size textarea when entering edit mode
  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing])

  const handleSave = React.useCallback(async () => {
    if (!specificationId || editContent === content) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/specs/${specificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prdMarkdown: editContent }),
      })
      if (res.ok) {
        onContentSaved?.(editContent)
        setIsEditing(false)
      }
    } catch (err) {
      console.error("[PrdPanel] Failed to save:", err)
    } finally {
      setIsSaving(false)
    }
  }, [specificationId, editContent, content, onContentSaved])

  const handleCancel = React.useCallback(() => {
    setEditContent(content)
    setIsEditing(false)
  }, [content])

  const handleExport = React.useCallback(() => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "prd.md"
    a.click()
    URL.revokeObjectURL(url)
  }, [content])

  if (!content && !isExtracting) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <p>The PRD will build up here as you discuss your idea.</p>
      </div>
    )
  }

  if (!content && isExtracting) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <ExtractionIndicator />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          PRD
        </h3>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-md border px-2 py-0.5 text-xs hover:bg-accent disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-md bg-loop-discovery px-2 py-0.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-md border px-2 py-0.5 text-xs hover:bg-accent"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="rounded-md border px-2 py-0.5 text-xs hover:bg-accent"
              >
                Export
              </button>
            </>
          )}
        </div>
      </div>

      {/* Extraction indicator */}
      {isExtracting && (
        <div className="px-4 pt-3">
          <ExtractionIndicator />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => {
              setEditContent(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = `${e.target.scrollHeight}px`
            }}
            className="min-h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none p-4 prose-headings:font-semibold prose-h1:text-base prose-h2:mt-4 prose-h2:border-b prose-h2:pb-1 prose-h2:text-sm prose-h3:text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
