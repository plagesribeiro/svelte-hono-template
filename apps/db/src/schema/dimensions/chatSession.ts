import { index, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { dimClientTable } from './client'
import { dimOrganizationTable } from './organization'

export const dimChatSessionTable = pgTable(
	'dim_chat_session',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		dimOrganizationId: uuid('dim_organization_id')
			.notNull()
			.references(() => dimOrganizationTable.id),
		dimClientId: uuid('dim_client_id').references(() => dimClientTable.id),
		messageCount: integer('message_count').notNull().default(0),
		windowStartedAt: timestamp('window_started_at'),
		lastMessageAt: timestamp('last_message_at'),

		// TIMESTAMPS
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(table) => [
		index('dim_chat_session_org_idx').on(table.dimOrganizationId),
		index('dim_chat_session_client_idx').on(table.dimClientId),
	]
)
