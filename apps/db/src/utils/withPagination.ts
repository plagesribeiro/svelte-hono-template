import type { PgSelectQueryBuilder } from 'drizzle-orm/pg-core'

/**
 * Apply pagination limit/offset to Drizzle ORM SELECT query builder
 *
 * @param qb Drizzle ORM SELECT query builder in dynamic mode
 * @param page page index
 * @param pageSize page size (i.e. count)
 * @returns Enhanced Drizzle ORM SELECT query builder with pagination limit/offset directives
 * @see https://orm.drizzle.team/docs/dynamic-query-building
 */
export const withPagination = <T extends PgSelectQueryBuilder>(qb: T, page: number, pageSize: number) =>
    qb.limit(pageSize).offset(Math.max((page - 1) * pageSize, 0))
