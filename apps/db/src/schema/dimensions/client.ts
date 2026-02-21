import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { dimOrganizationTable } from './organization'

export const dimClientTable = pgTable(
	'dim_client',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		dimOrganizationId: uuid('dim_organization_id')
			.notNull()
			.references(() => dimOrganizationTable.id),
		name: text('name').notNull(),
		phone: text('phone').notNull(),
		email: text('email'),

		// TIMESTAMPS
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		deletedAt: timestamp('deleted_at'),
	},
	(table) => [
		unique('dim_client_org_phone_unique').on(table.dimOrganizationId, table.phone),
		index('dim_client_org_idx').on(table.dimOrganizationId),
		index('dim_client_phone_idx').on(table.dimOrganizationId, table.phone),
	]
)
