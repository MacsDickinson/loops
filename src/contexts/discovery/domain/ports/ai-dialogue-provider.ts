export interface AIDialogueMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIDialogueProvider {
  streamDialogue(
    systemPrompt: string,
    messages: AIDialogueMessage[]
  ): ReadableStream<string>

  generateStructured<T>(
    systemPrompt: string,
    messages: AIDialogueMessage[],
    schema: { parse: (data: unknown) => T }
  ): Promise<T>
}
