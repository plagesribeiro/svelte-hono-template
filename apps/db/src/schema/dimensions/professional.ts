import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { dimOrganizationTable } from './organization'

export const dimProfessionalTable = pgTable(
	'dim_professional',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		dimOrganizationId: uuid('dim_organization_id')
			.notNull()
			.references(() => dimOrganizationTable.id),
		name: text('name').notNull(),
		phone: text('phone'),
		email: text('email'),
		avatarUrl: text('avatar_url'),
		isActive: boolean('is_active').notNull().default(true),
		workingHours: jsonb('working_hours'),

		// TIMESTAMPS
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		deletedAt: timestamp('deleted_at'),
	},
	(table) => [
		index('dim_professional_org_idx').on(table.dimOrganizationId),
		index('dim_professional_active_idx').on(table.dimOrganizationId, table.isActive),
	]
)
