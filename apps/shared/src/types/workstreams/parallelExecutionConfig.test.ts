import { describe, expect, it } from 'vitest'
import {
	canExecuteInParallel,
	DEFAULT_PARALLEL_EXECUTION_CONFIG,
	OPTIMIZED_PARALLEL_EXECUTION_CONFIG,
	type ParallelExecutionConfig,
	validateParallelExecutionConfig,
} from './parallelExecutionConfig'

describe('ParallelExecutionConfig', () => {
	describe('validateParallelExecutionConfig', () => {
		it('should validate default configuration successfully', () => {
			const result = validateParallelExecutionConfig(DEFAULT_PARALLEL_EXECUTION_CONFIG)

			expect(result.valid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it('should validate optimized configuration successfully', () => {
			const result = validateParallelExecutionConfig(OPTIMIZED_PARALLEL_EXECUTION_CONFIG)

			expect(result.valid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it('should detect overlap between parallelizable and sequential types', () => {
			const invalidConfig: ParallelExecutionConfig = {
				parallelizableTypes: ['extract', 'review'],
				crossTypeParallelizable: {},
				sequentialTypes: ['review', 'export'], // 'review' appears in both
				maxConcurrentPerGroup: undefined,
			}

			const result = validateParallelExecutionConfig(invalidConfig)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain(
				"Agent type 'review' cannot be both parallelizable and sequential"
			)
		})

		it('should detect missing agent types', () => {
			const invalidConfig: ParallelExecutionConfig = {
				parallelizableTypes: ['extract'],
				crossTypeParallelizable: {},
				sequentialTypes: ['export'], // Missing 'import' and 'review'
				maxConcurrentPerGroup: undefined,
			}

			const result = validateParallelExecutionConfig(invalidConfig)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain(
				"Agent type 'import' is not specified as either parallelizable or sequential"
			)
			expect(result.errors).toContain(
				"Agent type 'review' is not specified as either parallelizable or sequential"
			)
		})

		it('should detect cross-type references to non-parallelizable types', () => {
			const invalidConfig: ParallelExecutionConfig = {
				parallelizableTypes: ['extract'],
				crossTypeParallelizable: {
					extract: ['review'], // 'review' is not in parallelizableTypes
				},
				sequentialTypes: ['import', 'review', 'export'],
				maxConcurrentPerGroup: undefined,
			}

			const result = validateParallelExecutionConfig(invalidConfig)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain(
				"Cross-type target 'review' for 'extract' must also be in parallelizableTypes"
			)
		})

		it('should detect cross-type source not in parallelizable types', () => {
			const invalidConfig: ParallelExecutionConfig = {
				parallelizableTypes: ['extract'],
				crossTypeParallelizable: {
					review: ['extract'], // 'review' source is not in parallelizableTypes
				},
				sequentialTypes: ['import', 'review', 'export'],
				maxConcurrentPerGroup: undefined,
			}

			const result = validateParallelExecutionConfig(invalidConfig)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain(
				"Cross-type parallelizable agent 'review' must also be in parallelizableTypes"
			)
		})

		it('should validate maxConcurrentPerGroup constraints', () => {
			const invalidConfig: ParallelExecutionConfig = {
				parallelizableTypes: ['extract'],
				crossTypeParallelizable: {},
				sequentialTypes: ['import', 'review', 'export'],
				maxConcurrentPerGroup: 0, // Invalid value
			}

			const result = validateParallelExecutionConfig(invalidConfig)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain('maxConcurrentPerGroup must be at least 1 if specified')
		})

		it('should allow valid maxConcurrentPerGroup values', () => {
			const validConfig: ParallelExecutionConfig = {
				parallelizableTypes: ['extract'],
				crossTypeParallelizable: {},
				sequentialTypes: ['import', 'review', 'export'],
				maxConcurrentPerGroup: 5,
			}

			const result = validateParallelExecutionConfig(validConfig)

			expect(result.valid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})
	})

	describe('canExecuteInParallel', () => {
		const config: ParallelExecutionConfig = {
			parallelizableTypes: ['extract', 'review'],
			crossTypeParallelizable: {
				extract: ['review'],
				review: ['extract'],
			},
			sequentialTypes: ['import', 'export'],
		}

		it('should allow same type parallelization for parallelizable types', () => {
			expect(canExecuteInParallel('extract', 'extract', config)).toBe(true)
			expect(canExecuteInParallel('review', 'review', config)).toBe(true)
		})

		it('should not allow same type parallelization for sequential types', () => {
			expect(canExecuteInParallel('import', 'import', config)).toBe(false)
			expect(canExecuteInParallel('export', 'export', config)).toBe(false)
		})

		it('should allow cross-type parallelization when configured', () => {
			expect(canExecuteInParallel('extract', 'review', config)).toBe(true)
			expect(canExecuteInParallel('review', 'extract', config)).toBe(true)
		})

		it('should not allow cross-type parallelization when not configured', () => {
			const restrictiveConfig: ParallelExecutionConfig = {
				parallelizableTypes: ['extract', 'review'],
				crossTypeParallelizable: {}, // No cross-type rules
				sequentialTypes: ['import', 'export'],
			}

			expect(canExecuteInParallel('extract', 'review', restrictiveConfig)).toBe(false)
			expect(canExecuteInParallel('review', 'extract', restrictiveConfig)).toBe(false)
		})

		it('should not allow parallelization with sequential types', () => {
			expect(canExecuteInParallel('extract', 'import', config)).toBe(false)
			expect(canExecuteInParallel('review', 'export', config)).toBe(false)
			expect(canExecuteInParallel('import', 'extract', config)).toBe(false)
			expect(canExecuteInParallel('export', 'review', config)).toBe(false)
		})
	})

	describe('predefined configurations', () => {
		it('should have correct default configuration', () => {
			expect(DEFAULT_PARALLEL_EXECUTION_CONFIG).toEqual({
				parallelizableTypes: ['extract'],
				crossTypeParallelizable: {},
				sequentialTypes: ['import', 'review', 'export'],
				maxConcurrentPerGroup: undefined,
				enableOptimizations: false,
			})
		})

		it('should have correct optimized configuration', () => {
			expect(OPTIMIZED_PARALLEL_EXECUTION_CONFIG).toEqual({
				parallelizableTypes: ['extract', 'review'],
				crossTypeParallelizable: {
					extract: ['review'],
					review: ['extract'],
				},
				sequentialTypes: ['import', 'export'],
				maxConcurrentPerGroup: 5,
				enableOptimizations: true,
			})
		})

		it('should validate predefined configurations', () => {
			expect(validateParallelExecutionConfig(DEFAULT_PARALLEL_EXECUTION_CONFIG).valid).toBe(true)
			expect(validateParallelExecutionConfig(OPTIMIZED_PARALLEL_EXECUTION_CONFIG).valid).toBe(true)
		})
	})
})
