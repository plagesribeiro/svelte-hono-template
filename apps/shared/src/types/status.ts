/**
 * Centralized status enums to replace hardcoded strings throughout the codebase
 */

export enum WorkstreamRunStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    AWAITING_REVIEW = 'awaiting_review',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export enum WorkstreamAgentRunStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export enum DocumentQueueStatusEnum {
    INFERRING_COMPANY = 'inferring_company',
    INFER_COMPANY_FAILED = 'infer_company_failed',
    PENDING = 'pending',
    CLASSIFYING = 'classifying',
    CLASSIFIED = 'classified',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

// Type aliases for backward compatibility during migration
export type WorkstreamRunStatusType = `${WorkstreamRunStatus}`
export type WorkstreamAgentRunStatusType = `${WorkstreamAgentRunStatus}`
export type DocumentQueueStatusEnumType = `${DocumentQueueStatusEnum}`

// Helper to create tuple from enum for Drizzle schemas
export const WORKSTREAM_RUN_STATUS_VALUES = Object.values(WorkstreamRunStatus) as [
    WorkstreamRunStatusType,
    ...WorkstreamRunStatusType[],
]
export const WORKSTREAM_AGENT_RUN_STATUS_VALUES = Object.values(WorkstreamAgentRunStatus) as [
    WorkstreamAgentRunStatusType,
    ...WorkstreamAgentRunStatusType[],
]

// Helper functions
export const isWorkstreamRunCompleted = (status: WorkstreamRunStatusType): boolean =>
    status === WorkstreamRunStatus.COMPLETED

export const isWorkstreamRunRunning = (status: WorkstreamRunStatusType): boolean =>
    status === WorkstreamRunStatus.RUNNING

export const isWorkstreamRunFailed = (status: WorkstreamRunStatusType): boolean => status === WorkstreamRunStatus.FAILED

export const isWorkstreamRunPending = (status: WorkstreamRunStatusType): boolean =>
    status === WorkstreamRunStatus.PENDING

export const isWorkstreamRunCancelled = (status: WorkstreamRunStatusType): boolean =>
    status === WorkstreamRunStatus.CANCELLED

export const isAgentRunCompleted = (status: WorkstreamAgentRunStatusType): boolean =>
    status === WorkstreamAgentRunStatus.COMPLETED

export const isAgentRunRunning = (status: WorkstreamAgentRunStatusType): boolean =>
    status === WorkstreamAgentRunStatus.RUNNING

export const isAgentRunFailed = (status: WorkstreamAgentRunStatusType): boolean =>
    status === WorkstreamAgentRunStatus.FAILED

export const isAgentRunPending = (status: WorkstreamAgentRunStatusType): boolean =>
    status === WorkstreamAgentRunStatus.PENDING
