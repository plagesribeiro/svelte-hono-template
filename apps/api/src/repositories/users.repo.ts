import { type DbClient, dimUserTable } from 'db'
import { and, eq, isNull } from 'drizzle-orm'

export type User = typeof dimUserTable.$inferSelect

export class UsersRepository {
    constructor(private readonly db: DbClient) {}
    
    async getUserByClerkId(clerkUserId: string): Promise<User | null> {
        const [user] = await this.db
            .select()
            .from(dimUserTable)
            .where(and(eq(dimUserTable.clerkUserId, clerkUserId), isNull(dimUserTable.deletedAt)))
            .limit(1)

        return user ?? null
    }

    async upsertUser(input: { clerkUserId: string; email: string; name: string; username: string }): Promise<User> {
        const { clerkUserId, email, name, username } = input

        // Try to insert, on conflict update the user fields
        const [user] = await this.db
            .insert(dimUserTable)
            .values({
                clerkUserId,
                email,
                name,
                username,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            })
            .onConflictDoUpdate({
                target: dimUserTable.clerkUserId,
                set: {
                    email,
                    name,
                    username,
                    updatedAt: new Date(),
                    deletedAt: null, // Restore if soft deleted
                },
            })
            .returning()

        if (!user) {
            throw new Error('Failed to upsert user')
        }

        return user
    }

    async deleteUserByClerkId(clerkUserId: string): Promise<void> {
        await this.db
            .update(dimUserTable)
            .set({ deletedAt: new Date() })
            .where(eq(dimUserTable.clerkUserId, clerkUserId))
    }
}
