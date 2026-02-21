import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { dimOrganizationTable } from './organization'

export const dimServiceTable = pgTable(
	'dim_service',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		dimOrganizationId: uuid('dim_organization_id')
			.notNull()
			.references(() => dimOrganizationTable.id),
		name: text('name').notNull(),
		description: text('description'),
		durationMinutes: integer('duration_minutes').notNull(),
		price: integer('price').notNull(),
		currency: text('currency').notNull().default('BRL'),
		isActive: boolean('is_active').notNull().default(true),

		// TIMESTAMPS
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		deletedAt: timestamp('deleted_at'),
	},
	(table) => [
		index('dim_service_org_idx').on(table.dimOrganizationId),
		index('dim_service_active_idx').on(table.dimOrganizationId, table.isActive),
	]
)
