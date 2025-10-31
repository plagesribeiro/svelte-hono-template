import { z } from 'zod'

export const WorkstreamReviewAgentConfigSchema = z.object({
    type: z.literal('review'),
    config: z.object({
        // Review mode configuration
        reviewMode: z.enum(['automatic', 'always_human']).default('automatic'),

        // Review logic conditions
        checkAiDisagreement: z.boolean().default(true),
        checkLowConfidence: z.boolean().default(true),
        confidenceThreshold: z.number().min(0.6).max(0.9).default(0.8),
        checkValidationErrors: z.boolean().default(false),

        // Custom business rules
        customRulesEnabled: z.boolean().default(false),
        customRulesPrompt: z.string().optional(),

        // Field-specific review
        alwaysReviewFields: z.array(z.string()).default([]),

        // Reviewer assignment
        selectedReviewers: z.array(z.string()).default([]),
    }),
})

// Individual field review schema
export const ReviewedFieldSchema = z.object({
    fieldName: z.string(),
    status: z.enum(['approved', 'rejected', 'flagged', 'reviewed']),
    reason: z.string().optional(), // Reason why the field was reviewed (ai-disagreement, low-confidence, etc.)
    finalValue: z.string().optional(),
    originalValue: z.string().optional(), // Original value before human review
    humanReviewed: z.boolean().default(false), // Was this field reviewed by human?
    humanDecision: z.string().optional(), // Human decision (approved, corrected, rejected)
    reviewerId: z.string().optional(), // ID of the reviewer who made the decision
    aiValues: z
        .array(
            z.object({
                model: z.string(),
                value: z.string(),
                confidence: z.number().optional(),
                page: z.number().optional(),
                sourceText: z.string().optional(),
            }),
        )
        .optional(), // All AI model values for comparison
    extractAgentRunId: z.string().optional(), // ID of the extract agent run that produced this field
    documentId: z.string().optional(), // ID of the document this field was extracted from
})

// Grouped structure for agent runs with their fields
export const WorkstreamAgentRunReviewSchema = z.object({
    workstreamAgentRunId: z.string(),
    workstreamAgentId: z.string(),
    workstreamAgentName: z.string(),
    documentId: z.string(),
    documentName: z.string().optional(),
    documentType: z.string().optional(), // COI, SPA, etc.
    fields: z.array(ReviewedFieldSchema),
    totalFields: z.number(),
    approvedFields: z.number(),
    flaggedFields: z.number(),
    rejectedFields: z.number(),
})

// Flat structure for backward compatibility
export const WorkstreamReviewAgentResultSchema = z.object({
    type: z.literal('review'),
    result: z.object({
        status: z.enum(['approved', 'rejected', 'flagged_for_review']),
        confidence: z.number(),
        reviewedFields: z.array(ReviewedFieldSchema),
        processingTime: z.number(),
        requiresHumanIntervention: z.boolean(),
        humanReviewCompleted: z.boolean().optional(), // Indicates if human review was completed
        humanReviewTimestamp: z.number().optional(), // When human review was completed
    }),
})

// Hierarchical structure for better organization
export const WorkstreamReviewAgentHierarchicalResultSchema = z.object({
    type: z.literal('review'),
    result: z.object({
        status: z.enum(['approved', 'rejected', 'flagged_for_review']),
        confidence: z.number(),
        processingTime: z.number(),
        requiresHumanIntervention: z.boolean(),
        humanReviewCompleted: z.boolean().optional(),
        humanReviewTimestamp: z.number().optional(),
        // Hierarchical structure
        workstreamRunId: z.string(),
        agentRuns: z.array(WorkstreamAgentRunReviewSchema),
        // Summary statistics
        summary: z.object({
            totalFields: z.number(),
            approvedFields: z.number(),
            flaggedFields: z.number(),
            rejectedFields: z.number(),
            totalDocuments: z.number(),
        }),
    }),
})

export type WorkstreamReviewAgentConfig = z.infer<typeof WorkstreamReviewAgentConfigSchema>
export type WorkstreamReviewAgentResult = z.infer<typeof WorkstreamReviewAgentResultSchema>
export type WorkstreamReviewAgentHierarchicalResult = z.infer<typeof WorkstreamReviewAgentHierarchicalResultSchema>
export type WorkstreamAgentRunReview = z.infer<typeof WorkstreamAgentRunReviewSchema>
export type ReviewedField = z.infer<typeof ReviewedFieldSchema>
