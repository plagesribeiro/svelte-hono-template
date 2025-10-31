import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'

export const getDbClient = (connectionString: string) => {
    return drizzle({
        client: neon(connectionString),
        schema,
        logger: false,
    })
}

export type DbClient = ReturnType<typeof getDbClient>
