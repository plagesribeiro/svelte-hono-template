import { z } from 'zod'

import * as agents from './agents'

export * from './agents'
export * from './parallelExecutionConfig'

export const WorkstreamAgentTypes = ['import', 'extract', 'review', 'export'] as const

export type WorkstreamAgentType = (typeof WorkstreamAgentTypes)[number]

// Base workstream agent interface
export interface WorkstreamAgent {
	id: string
	workstreamId: string
	type: WorkstreamAgentType
	order: number
	name: string
	description?: string
	createdBy: string
	lastUpdatedBy: string
	createdAt: string
	updatedAt: string
	config?: WorkstreamAgentConfig
	version?: number
}

export const WorkstreamAgentConfigSchema = z.discriminatedUnion('type', [
	agents.WorkstreamImportAgentConfigSchema,
	agents.WorkstreamExtractAgentConfigSchema,
	agents.WorkstreamReviewAgentConfigSchema,
	agents.WorkstreamExportAgentConfigSchema,
])

export const WorkstreamAgentResultSchema = z.discriminatedUnion('type', [
	agents.WorkstreamImportAgentResultSchema,
	agents.WorkstreamExtractAgentResultSchema,
	agents.WorkstreamReviewAgentResultSchema,
	agents.WorkstreamExportAgentResultSchema,
])

export type WorkstreamAgentConfig = z.infer<typeof WorkstreamAgentConfigSchema>
export type WorkstreamAgentResult = z.infer<typeof WorkstreamAgentResultSchema>
