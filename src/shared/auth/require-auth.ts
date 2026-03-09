import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export interface AuthenticatedUser {
  clerkUserId: string
  email: string
  name: string
}

/**
 * Requires authentication via Clerk.
 * Returns the authenticated user or a 401 NextResponse.
 */
export async function requireAuth(): Promise<AuthenticatedUser | NextResponse> {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Please sign in to continue.',
        retryable: false,
      },
      { status: 401 }
    )
  }

  return {
    clerkUserId: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    name:
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.username ||
      'Unknown',
  }
}
