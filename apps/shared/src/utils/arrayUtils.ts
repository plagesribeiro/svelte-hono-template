/**
 * Splits an array into chunks of a specified size
 * @param array - The array to split
 * @param size - The maximum size of each chunk
 * @returns An array of chunks
 *
 * @example
 * ```typescript
 * chunkArray([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}
