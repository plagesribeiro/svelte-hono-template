import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { dimOrganizationTable } from './organization'

export const dimCourtTable = pgTable(
	'dim_court',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		dimOrganizationId: uuid('dim_organization_id')
			.notNull()
			.references(() => dimOrganizationTable.id),
		name: text('name').notNull(),
		sport: text('sport').notNull(),
		description: text('description'),
		pricePerSlot: integer('price_per_slot').notNull(),
		slotDurationMinutes: integer('slot_duration_minutes').notNull().default(60),
		breakBetweenMinutes: integer('break_between_minutes').notNull().default(0),
		operatingHours: jsonb('operating_hours'),
		currency: text('currency').notNull().default('BRL'),
		isActive: boolean('is_active').notNull().default(true),

		// TIMESTAMPS
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		deletedAt: timestamp('deleted_at'),
	},
	(table) => [
		index('dim_court_org_idx').on(table.dimOrganizationId),
		index('dim_court_active_idx').on(table.dimOrganizationId, table.isActive),
	]
)
