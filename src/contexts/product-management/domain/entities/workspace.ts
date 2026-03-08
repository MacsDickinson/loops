export interface Workspace {
  id: string
  name: string
  ownerUserId: string
  subscriptionTier: 'free' | 'pro' | 'team'
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}
