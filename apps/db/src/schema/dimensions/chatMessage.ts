import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { dimChatSessionTable } from './chatSession'

export const dimChatMessageTable = pgTable(
	'dim_chat_message',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		dimChatSessionId: uuid('dim_chat_session_id')
			.notNull()
			.references(() => dimChatSessionTable.id),
		role: text('role', { enum: ['user', 'assistant', 'tool_use', 'tool_result'] }).notNull(),
		content: text('content'),
		toolName: text('tool_name'),
		toolInput: jsonb('tool_input'),
		toolResult: jsonb('tool_result'),

		// TIMESTAMPS (append-only, no soft delete)
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [
		index('dim_chat_message_session_idx').on(table.dimChatSessionId),
		index('dim_chat_message_created_idx').on(table.dimChatSessionId, table.createdAt),
	]
)
