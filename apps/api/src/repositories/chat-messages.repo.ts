import { type DbClient, dimChatMessageTable } from 'db'
import { asc, eq } from 'drizzle-orm'

export type ChatMessage = typeof dimChatMessageTable.$inferSelect

export class ChatMessagesRepository {
	constructor(private readonly db: DbClient) {}

	async create(input: {
		dimChatSessionId: string
		role: 'user' | 'assistant' | 'tool_use' | 'tool_result'
		content?: string | null
		toolName?: string | null
		toolInput?: unknown
		toolResult?: unknown
	}): Promise<ChatMessage> {
		const [message] = await this.db
			.insert(dimChatMessageTable)
			.values({
				dimChatSessionId: input.dimChatSessionId,
				role: input.role,
				content: input.content ?? null,
				toolName: input.toolName ?? null,
				toolInput: input.toolInput ?? null,
				toolResult: input.toolResult ?? null,
				createdAt: new Date(),
			})
			.returning()

		if (!message) {
			throw new Error('Failed to create chat message')
		}

		return message
	}

	async listBySession(sessionId: string): Promise<ChatMessage[]> {
		return this.db
			.select()
			.from(dimChatMessageTable)
			.where(eq(dimChatMessageTable.dimChatSessionId, sessionId))
			.orderBy(asc(dimChatMessageTable.createdAt))
	}

	async createMany(
		messages: Array<{
			dimChatSessionId: string
			role: 'user' | 'assistant' | 'tool_use' | 'tool_result'
			content?: string | null
			toolName?: string | null
			toolInput?: unknown
			toolResult?: unknown
		}>
	): Promise<ChatMessage[]> {
		if (messages.length === 0) {
			return []
		}

		const now = new Date()

		return this.db
			.insert(dimChatMessageTable)
			.values(
				messages.map((msg) => ({
					dimChatSessionId: msg.dimChatSessionId,
					role: msg.role,
					content: msg.content ?? null,
					toolName: msg.toolName ?? null,
					toolInput: msg.toolInput ?? null,
					toolResult: msg.toolResult ?? null,
					createdAt: now,
				}))
			)
			.returning()
	}
}
