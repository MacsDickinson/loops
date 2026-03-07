import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogClient(): PostHog | null {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

  if (!apiKey) {
    console.warn('PostHog API key not configured')
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(apiKey, {
      host,
    })
  }

  return posthogClient
}

export async function trackServerEvent(
  event: string,
  properties?: Record<string, unknown>,
  userId?: string
) {
  const client = getPostHogClient()

  if (!client) {
    return
  }

  try {
    client.capture({
      distinctId: userId || 'anonymous',
      event,
      properties,
    })

    await client.shutdown()
  } catch (error) {
    console.error('Failed to track server event:', error)
  }
}
