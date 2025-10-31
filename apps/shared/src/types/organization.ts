export const organizationMemberRoles = ['admin', 'member'] as const

export type OrganizationMemberRole = (typeof organizationMemberRoles)[number]
