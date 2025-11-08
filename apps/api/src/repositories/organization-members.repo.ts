import { type DbClient, dimOrganizationMemberTable } from 'db'
import { and, eq } from 'drizzle-orm'

export type OrganizationMember = typeof dimOrganizationMemberTable.$inferSelect

export class OrganizationMembersRepository {
	constructor(private readonly db: DbClient) {}

	async upsertMember(input: {
		organizationId: string
		userId: string
		role: 'admin' | 'member' | 'viewer'
	}): Promise<OrganizationMember> {
		const { organizationId, userId, role } = input

		// Check if member already exists (including soft-deleted)
		const [existingMember] = await this.db
			.select()
			.from(dimOrganizationMemberTable)
			.where(
				and(
					eq(dimOrganizationMemberTable.dimOrganizationId, organizationId),
					eq(dimOrganizationMemberTable.dimUserId, userId)
				)
			)
			.limit(1)

		if (existingMember) {
			// Update existing member (restore if soft deleted)
			const [updatedMember] = await this.db
				.update(dimOrganizationMemberTable)
				.set({
					role,
					updatedAt: new Date(),
					deletedAt: null, // Restore if soft deleted
				})
				.where(
					and(
						eq(dimOrganizationMemberTable.dimOrganizationId, organizationId),
						eq(dimOrganizationMemberTable.dimUserId, userId)
					)
				)
				.returning()

			if (!updatedMember) {
				throw new Error('Failed to update organization member')
			}

			return updatedMember
		}

		// Insert new member
		const [newMember] = await this.db
			.insert(dimOrganizationMemberTable)
			.values({
				dimOrganizationId: organizationId,
				dimUserId: userId,
				role,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			})
			.returning()

		if (!newMember) {
			throw new Error('Failed to insert organization member')
		}

		return newMember
	}

	async deleteMember(organizationId: string, userId: string): Promise<void> {
		await this.db
			.update(dimOrganizationMemberTable)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(dimOrganizationMemberTable.dimOrganizationId, organizationId),
					eq(dimOrganizationMemberTable.dimUserId, userId)
				)
			)
	}
}
