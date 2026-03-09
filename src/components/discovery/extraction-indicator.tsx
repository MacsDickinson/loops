"use client"

import * as React from "react"

const PHRASES = [
  "Analysing conversation…",
  "Extracting insights…",
  "Connecting the dots…",
  "Distilling requirements…",
  "Crystallising ideas…",
  "Pattern matching…",
  "Reading between the lines…",
  "Synthesising themes…",
  "Mapping the territory…",
  "Sharpening the spec…",
]

export function ExtractionIndicator() {
  const [phraseIndex, setPhraseIndex] = React.useState(
    () => Math.floor(Math.random() * PHRASES.length)
  )

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-loop-discovery-border bg-loop-discovery-subtle px-3 py-2">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-loop-discovery [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-loop-discovery [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-loop-discovery" />
      </div>
      <span
        key={phraseIndex}
        className="animate-in fade-in text-xs font-medium text-loop-discovery duration-300"
      >
        {PHRASES[phraseIndex]}
      </span>
    </div>
  )
}
