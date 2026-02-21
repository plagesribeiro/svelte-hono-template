import { type DbClient, dimOrganizationTable } from 'db'
import { and, eq, isNull } from 'drizzle-orm'

export type Organization = typeof dimOrganizationTable.$inferSelect

export class OrganizationsRepository {
	constructor(private readonly db: DbClient) {}

	async getOrganizationByClerkId(clerkOrganizationId: string): Promise<Organization | null> {
		const [organization] = await this.db
			.select()
			.from(dimOrganizationTable)
			.where(eq(dimOrganizationTable.clerkOrganizationId, clerkOrganizationId))
			.limit(1)

		return organization ?? null
	}

	async upsertOrganization(input: {
		clerkOrganizationId: string
		name: string
		email: string
		createdBy: string
		lastUpdatedBy: string
	}): Promise<Organization> {
		const { clerkOrganizationId, name, email, createdBy, lastUpdatedBy } = input

		// Try to insert, on conflict update the organization fields
		const [organization] = await this.db
			.insert(dimOrganizationTable)
			.values({
				clerkOrganizationId,
				name,
				email,
				description: null,
				isMasterOrg: false,
				isTemplateOrg: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
				createdBy,
				lastUpdatedBy,
			})
			.onConflictDoUpdate({
				target: dimOrganizationTable.clerkOrganizationId,
				set: {
					name,
					email,
					updatedAt: new Date(),
					lastUpdatedBy,
					deletedAt: null, // Restore if soft deleted
				},
			})
			.returning()

		if (!organization) {
			throw new Error('Failed to upsert organization')
		}

		return organization
	}

	async updateById(
		id: string,
		input: Partial<{
			slug: string | null
			businessType: 'barbershop' | 'court' | null
			businessHours: unknown
			timezone: string | null
			phone: string | null
			address: string | null
			logoUrl: string | null
			chatWelcomeMessage: string | null
			chatInstructions: string | null
			onboardingCompleted: boolean
			name: string
			description: string | null
		}>
	): Promise<Organization> {
		const [org] = await this.db
			.update(dimOrganizationTable)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(dimOrganizationTable.id, id))
			.returning()

		if (!org) {
			throw new Error('Failed to update organization')
		}

		return org
	}

	async getBySlug(slug: string): Promise<Organization | null> {
		const [org] = await this.db
			.select()
			.from(dimOrganizationTable)
			.where(and(eq(dimOrganizationTable.slug, slug), isNull(dimOrganizationTable.deletedAt)))
			.limit(1)

		return org ?? null
	}

	async deleteOrganizationByClerkId(clerkOrganizationId: string): Promise<void> {
		await this.db
			.update(dimOrganizationTable)
			.set({ deletedAt: new Date() })
			.where(eq(dimOrganizationTable.clerkOrganizationId, clerkOrganizationId))
	}
}
