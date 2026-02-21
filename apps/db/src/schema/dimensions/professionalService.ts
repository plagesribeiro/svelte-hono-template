import { index, integer, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { dimProfessionalTable } from './professional'
import { dimServiceTable } from './service'

export const dimProfessionalServiceTable = pgTable(
	'dim_professional_service',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		dimProfessionalId: uuid('dim_professional_id')
			.notNull()
			.references(() => dimProfessionalTable.id),
		dimServiceId: uuid('dim_service_id')
			.notNull()
			.references(() => dimServiceTable.id),
		customDurationMinutes: integer('custom_duration_minutes'),
		customPrice: integer('custom_price'),

		// TIMESTAMPS
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		deletedAt: timestamp('deleted_at'),
	},
	(table) => [
		unique('dim_professional_service_unique').on(table.dimProfessionalId, table.dimServiceId),
		index('dim_professional_service_professional_idx').on(table.dimProfessionalId),
		index('dim_professional_service_service_idx').on(table.dimServiceId),
	]
)
