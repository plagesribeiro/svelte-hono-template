import { type DbClient, dimChatSessionTable } from 'db'
import { eq } from 'drizzle-orm'

export type ChatSession = typeof dimChatSessionTable.$inferSelect

export class ChatSessionsRepository {
	constructor(private readonly db: DbClient) {}

	async create(orgId: string): Promise<ChatSession> {
		const [session] = await this.db
			.insert(dimChatSessionTable)
			.values({
				dimOrganizationId: orgId,
				messageCount: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()

		if (!session) {
			throw new Error('Failed to create chat session')
		}

		return session
	}

	async getById(id: string): Promise<ChatSession | null> {
		const [session] = await this.db
			.select()
			.from(dimChatSessionTable)
			.where(eq(dimChatSessionTable.id, id))
			.limit(1)

		return session ?? null
	}

	async updateMessageCount(
		id: string,
		messageCount: number,
		windowStartedAt: Date | null
	): Promise<void> {
		await this.db
			.update(dimChatSessionTable)
			.set({
				messageCount,
				windowStartedAt,
				lastMessageAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(dimChatSessionTable.id, id))
	}

	async linkClient(sessionId: string, clientId: string): Promise<void> {
		await this.db
			.update(dimChatSessionTable)
			.set({
				dimClientId: clientId,
				updatedAt: new Date(),
			})
			.where(eq(dimChatSessionTable.id, sessionId))
	}
}
