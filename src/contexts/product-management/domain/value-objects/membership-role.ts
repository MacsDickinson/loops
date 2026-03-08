export const MembershipRoles = ['owner', 'admin', 'member', 'viewer'] as const

export type MembershipRole = (typeof MembershipRoles)[number]

const roleHierarchy: Record<MembershipRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
}

export function hasMinimumRole(
  userRole: MembershipRole,
  requiredRole: MembershipRole
): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
