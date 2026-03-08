/**
 * Classifies API errors into user-friendly responses.
 * Never exposes raw error messages to clients.
 */

interface ClassifiedError {
  status: number
  body: {
    error: string
    message: string
    retryable: boolean
  }
}

export function classifyApiError(error: unknown): ClassifiedError {
  if (!(error instanceof Error)) {
    return {
      status: 500,
      body: {
        error: 'Internal server error',
        message: 'Something went wrong. Please try again.',
        retryable: true,
      },
    }
  }

  const message = error.message.toLowerCase()

  if (message.includes('rate_limit') || message.includes('429')) {
    return {
      status: 429,
      body: {
        error: 'AI service is busy',
        message:
          'The AI service is currently rate limited. Please retry shortly.',
        retryable: true,
      },
    }
  }

  if (
    message.includes('authentication') ||
    message.includes('api key') ||
    message.includes('unauthorized')
  ) {
    return {
      status: 503,
      body: {
        error: 'AI service unavailable',
        message:
          'The AI service is temporarily unavailable. Please contact support if this persists.',
        retryable: false,
      },
    }
  }

  if (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('fetch failed')
  ) {
    return {
      status: 504,
      body: {
        error: 'Request timeout',
        message:
          'The request took too long due to a network issue. Please try again.',
        retryable: true,
      },
    }
  }

  return {
    status: 500,
    body: {
      error: 'Internal server error',
      message: 'Something went wrong. Please try again.',
      retryable: true,
    },
  }
}
