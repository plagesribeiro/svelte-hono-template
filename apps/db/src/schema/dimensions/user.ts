import { char, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const dimUserTable = pgTable(
	'dim_user',
	{
		id: uuid('id').primaryKey().defaultRandom().notNull(),
		clerkUserId: char('clerk_user_id', { length: 32 }).notNull().unique(),
		email: text('email').notNull().unique(),
		username: text('username').notNull().unique(),
		name: text('name').notNull(),

		// TIMESTAMPS
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		deletedAt: timestamp('deleted_at'),
	},
	(table) => [
		// Indexes for Clerk sync and lookups
		index('dim_user_clerk_id_idx').on(table.clerkUserId),
		index('dim_user_email_idx').on(table.email),
		index('dim_user_username_idx').on(table.username),
	]
)
