'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

    if (apiKey && typeof window !== 'undefined') {
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll manually capture for better control
        capture_pageleave: true,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.debug()
          }
        },
      })
    }
  }, [])

  return <>{children}</>
}

export function PostHogIdentifier() {
  const { user } = useUser()

  useEffect(() => {
    if (user?.id) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        subscriptionTier: 'free', // TODO: Get from user metadata
      })
    }
  }, [user])

  return null
}
