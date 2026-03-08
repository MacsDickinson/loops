export interface User {
  id: string
  clerkUserId: string
  email: string
  name: string | null
  githubAccessToken: string | null
  linearAccessToken: string | null
  subscriptionTier: 'free' | 'pro' | 'team'
  createdAt: Date
  updatedAt: Date
  lastActiveAt: Date | null
}
