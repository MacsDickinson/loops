/**
 * Simple in-process event bus for domain events.
 * No external infrastructure — swap for a real message queue later if needed.
 */

type EventHandler<T = unknown> = (event: T) => Promise<void>

class EventBus {
  private handlers = new Map<string, EventHandler[]>()

  subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventType) || []
    existing.push(handler as EventHandler)
    this.handlers.set(eventType, existing)
  }

  async publish<T>(eventType: string, event: T): Promise<void> {
    const fns = this.handlers.get(eventType) || []
    await Promise.allSettled(fns.map((fn) => fn(event)))
  }

  clear(): void {
    this.handlers.clear()
  }
}

export const eventBus = new EventBus()

// Domain event types
export const DomainEvents = {
  SPECIFICATION_COMPLETED: 'specification.completed',
  IDEA_GRADUATED: 'idea.graduated',
  FEATURE_LIFECYCLE_CHANGED: 'feature.lifecycle_changed',
  SPECIFICATION_CHANGED: 'specification.changed',
} as const
