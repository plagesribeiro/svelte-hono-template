import type { CondensedField } from '../types/workstreams/agents/exportAgent'

/**
 * Formats condensed fields for export in a horizontal layout format.
 *
 * Creates a 2D array where:
 * - First row contains field names (headers)
 * - Second row contains corresponding final values
 *
 * This format is optimal for both Google Sheets and Excel exports.
 *
 * @param fields Array of condensed fields to format
 * @returns 2D array: [fieldNames, finalValues]
 *
 * @example
 * ```typescript
 * const fields = [
 *   { fieldName: 'Name', finalValue: 'John Doe', ... },
 *   { fieldName: 'Email', finalValue: 'john@example.com', ... }
 * ]
 *
 * const result = formatCondensedFieldsForExport(fields)
 * // Returns: [['Name', 'Email'], ['John Doe', 'john@example.com']]
 * ```
 */
export function formatCondensedFieldsForExport(fields: CondensedField[]): string[][] {
    if (fields.length === 0) {
        return [[], []]
    }

    const fieldNames = fields.map((field) => field.fieldName)
    const finalValues = fields.map((field) => field.finalValue)

    return [fieldNames, finalValues]
}
