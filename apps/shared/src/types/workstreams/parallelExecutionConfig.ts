import type { WorkstreamAgentType } from './index'

/**
 * Configuration for parallel execution of workstream agents
 *
 * This configuration determines which agent types can be executed in parallel
 * and how they should be grouped for optimal performance.
 */
export interface ParallelExecutionConfig {
    /**
     * Agent types that can run in parallel with other agents of the same type
     * Example: ['extract', 'review'] allows multiple extract agents to run together
     * and multiple review agents to run together, but not mixed
     */
    parallelizableTypes: WorkstreamAgentType[]

    /**
     * Agent types that can run in parallel with different agent types
     * Key: agent type, Value: array of other agent types it can run in parallel with
     * Example: { extract: ['review'], review: ['extract'] } allows extract and review agents to run together
     */
    crossTypeParallelizable: Partial<Record<WorkstreamAgentType, WorkstreamAgentType[]>>

    /**
     * Agent types that must always execute sequentially (one at a time)
     * These agents cannot be grouped with any other agents for parallel execution
     */
    sequentialTypes: WorkstreamAgentType[]

    /**
     * Maximum number of concurrent agents allowed per execution group
     * This provides a performance safeguard to prevent resource exhaustion
     * If undefined, no limit is applied
     */
    maxConcurrentPerGroup?: number

    /**
     * Whether to enable performance optimizations for parallel execution
     * When enabled, applies additional heuristics for optimal grouping
     */
    enableOptimizations?: boolean
}

/**
 * Default parallel execution configuration that maintains backward compatibility
 * Only extract agents can run in parallel, all others execute sequentially
 */
export const DEFAULT_PARALLEL_EXECUTION_CONFIG: ParallelExecutionConfig = {
    parallelizableTypes: ['extract'],
    crossTypeParallelizable: {},
    sequentialTypes: ['import', 'review', 'export'],
    maxConcurrentPerGroup: undefined,
    enableOptimizations: false,
}

/**
 * Alternative configuration that allows more aggressive parallel execution
 * Useful for workstreams with independent agent operations
 */
export const OPTIMIZED_PARALLEL_EXECUTION_CONFIG: ParallelExecutionConfig = {
    parallelizableTypes: ['extract', 'review'],
    crossTypeParallelizable: {
        extract: ['review'],
        review: ['extract'],
    },
    sequentialTypes: ['import', 'export'],
    maxConcurrentPerGroup: 5,
    enableOptimizations: true,
}

/**
 * Utility function to validate parallel execution configuration
 * Ensures configuration is logically consistent
 */
export function validateParallelExecutionConfig(config: ParallelExecutionConfig): {
    valid: boolean
    errors: string[]
} {
    const errors: string[] = []
    const allAgentTypes: WorkstreamAgentType[] = ['import', 'extract', 'review', 'export']

    // Check for overlaps between parallelizable and sequential types
    const parallelizableSet = new Set(config.parallelizableTypes)
    const sequentialSet = new Set(config.sequentialTypes)

    for (const type of config.parallelizableTypes) {
        if (sequentialSet.has(type)) {
            errors.push(`Agent type '${type}' cannot be both parallelizable and sequential`)
        }
    }

    // Check that all agent types are accounted for
    const accountedTypes = new Set([...config.parallelizableTypes, ...config.sequentialTypes])
    for (const type of allAgentTypes) {
        if (!accountedTypes.has(type)) {
            errors.push(`Agent type '${type}' is not specified as either parallelizable or sequential`)
        }
    }

    // Validate cross-type parallelization references
    for (const [sourceType, targetTypes] of Object.entries(config.crossTypeParallelizable)) {
        const source = sourceType as WorkstreamAgentType

        // Source type should be parallelizable
        if (!parallelizableSet.has(source)) {
            errors.push(`Cross-type parallelizable agent '${source}' must also be in parallelizableTypes`)
        }

        // Target types should also be parallelizable
        for (const targetType of targetTypes || []) {
            if (!parallelizableSet.has(targetType)) {
                errors.push(`Cross-type target '${targetType}' for '${source}' must also be in parallelizableTypes`)
            }
        }
    }

    // Validate maxConcurrentPerGroup
    if (config.maxConcurrentPerGroup !== undefined && config.maxConcurrentPerGroup < 1) {
        errors.push('maxConcurrentPerGroup must be at least 1 if specified')
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Helper function to determine if two agent types can be executed in parallel
 * based on the provided configuration
 */
export function canExecuteInParallel(
    type1: WorkstreamAgentType,
    type2: WorkstreamAgentType,
    config: ParallelExecutionConfig,
): boolean {
    // Same type parallelization
    if (type1 === type2) {
        return config.parallelizableTypes.includes(type1)
    }

    // Cross-type parallelization
    const crossParallel = config.crossTypeParallelizable[type1] || []
    return crossParallel.includes(type2)
}

export type { WorkstreamAgentType } from './index'
