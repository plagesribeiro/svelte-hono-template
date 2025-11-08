import { boolean, char, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { dimUserTable } from './user'

export const dimOrganizationTable = pgTable(
	'dim_organization',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		clerkOrganizationId: char('clerk_organization_id', { length: 31 }).notNull().unique(),
		email: text('email').notNull().unique(),
		name: text('name').notNull(),
		description: text('description'),

		// SPECIAL FLAGS FOR RLS
		isMasterOrg: boolean('is_master_org').notNull().default(false),
		isTemplateOrg: boolean('is_template_org').notNull().default(false),

		// TIMESTAMPS
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		deletedAt: timestamp('deleted_at'),

		// BLAME
		createdBy: uuid('created_by')
			.notNull()
			.references(() => dimUserTable.id),
		lastUpdatedBy: uuid('last_updated_by')
			.notNull()
			.references(() => dimUserTable.id),
	},
	(table) => [
		// Indexes for Clerk sync and RLS lookups
		index('dim_organization_clerk_id_idx').on(table.clerkOrganizationId),
		index('dim_organization_email_idx').on(table.email),
		// Indexes for RLS flag lookups
		index('dim_organization_is_master_idx').on(table.isMasterOrg),
		index('dim_organization_is_template_idx').on(table.isTemplateOrg),
	]
)
