import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { dimChatSessionTable } from './chatSession'
import { dimClientTable } from './client'
import { dimCourtTable } from './court'
import { dimOrganizationTable } from './organization'
import { dimProfessionalTable } from './professional'
import { dimServiceTable } from './service'

export const dimBookingTable = pgTable(
	'dim_booking',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		dimOrganizationId: uuid('dim_organization_id')
			.notNull()
			.references(() => dimOrganizationTable.id),
		dimClientId: uuid('dim_client_id')
			.notNull()
			.references(() => dimClientTable.id),
		dimProfessionalId: uuid('dim_professional_id').references(() => dimProfessionalTable.id),
		dimServiceId: uuid('dim_service_id').references(() => dimServiceTable.id),
		dimCourtId: uuid('dim_court_id').references(() => dimCourtTable.id),
		startTime: timestamp('start_time').notNull(),
		endTime: timestamp('end_time').notNull(),
		status: text('status', {
			enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
		})
			.notNull()
			.default('confirmed'),
		priceCharged: integer('price_charged'),
		notes: text('notes'),
		cancelledAt: timestamp('cancelled_at'),
		cancelReason: text('cancel_reason'),
		dimChatSessionId: uuid('dim_chat_session_id').references(() => dimChatSessionTable.id),
		version: integer('version').notNull().default(1),

		// TIMESTAMPS
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		deletedAt: timestamp('deleted_at'),
	},
	(table) => [
		index('dim_booking_org_idx').on(table.dimOrganizationId),
		index('dim_booking_client_idx').on(table.dimClientId),
		index('dim_booking_professional_idx').on(table.dimProfessionalId),
		index('dim_booking_court_idx').on(table.dimCourtId),
		index('dim_booking_time_idx').on(table.dimOrganizationId, table.startTime, table.endTime),
		index('dim_booking_status_idx').on(table.dimOrganizationId, table.status),
	]
)
