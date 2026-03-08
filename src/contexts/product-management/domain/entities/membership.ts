import type { MembershipRole } from '../value-objects/membership-role'

export interface Membership {
  id: string
  workspaceId: string
  userId: string
  role: MembershipRole
  invitedBy: string | null
  joinedAt: Date
}
