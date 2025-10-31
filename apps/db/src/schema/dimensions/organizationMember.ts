import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { dimOrganizationTable } from './organization'
import { dimUserTable } from './user'

export const dimOrganizationMemberTable = pgTable(
	'dim_organization_member',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		dimOrganizationId: uuid('dim_organization_id')
			.notNull()
			.references(() => dimOrganizationTable.id),
		dimUserId: uuid('dim_user_id')
			.notNull()
			.references(() => dimUserTable.id),
		role: text('role', {
			enum: ['admin', 'member', 'viewer'],
		}).notNull(),

		// TIMESTAMPS
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		deletedAt: timestamp('deleted_at'),
	},
	(table) => [
		// Composite index for unique member per org
		index('dim_organization_member_org_user_idx').on(table.dimOrganizationId, table.dimUserId),
		// Index for reverse lookups (user's organizations)
		index('dim_organization_member_user_idx').on(table.dimUserId)
	],
)