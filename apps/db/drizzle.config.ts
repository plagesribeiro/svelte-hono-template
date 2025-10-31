import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config({ path: '../api/.dev.vars' })

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
}

export default defineConfig({
	out: './migrations',
	schema: './src/schema/index.ts', // ← NOVO SCHEMA com RLS
	dialect: 'postgresql',
	dbCredentials: {
		url: `${process.env.DATABASE_URL}?sslmode=require`,
	},
	// Enable RLS role and policy management in migrations
	entities: {
		roles: {
			provider: 'neon', // Exclude Neon's predefined roles from migrations
		},
	},
})
