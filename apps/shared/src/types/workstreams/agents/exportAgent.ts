import { z } from 'zod'

export const WorkstreamExportAgentConfigSchema = z.object({
    type: z.literal('export'),
    config: z.object({
        destinations: z.array(
            z.object({
                // default
                type: z.enum(['google-sheets', 'email']),
                active: z.boolean().default(false),
                // sheets
                token: z.string().optional(),
                refreshToken: z.string().optional(),
                option: z.enum(['new', 'append']).optional(),
                pathName: z.string().optional(),
                // email
                format: z.enum(['csv', 'xlsx', 'json', 'xml']).optional(),
                encoding: z.enum(['utf8', 'ascii', 'latin1']).optional(),
                recipients: z.array(z.string()).optional(),
                subject: z.string().optional(),
            }),
        ),
        destinationPrompt: z.string().optional(),
    }),
})

export const WorkstreamExportAgentResultSchema = z.object({
    type: z.literal('export'),
    result: z.object({
        destinations: z.array(
            z.object({
                type: z.string(),
                status: z.enum(['success', 'failed']),
                message: z.string().optional(),
                data: z
                    .object({
                        url: z.string().optional(),
                        recipients: z.array(z.string()).optional(),
                        subject: z.string().optional(),
                    })
                    .optional(),
                operationType: z.string().optional(),
                timestamp: z.string().optional(),
            }),
        ),
    }),
})

export type WorkstreamExportAgentConfig = z.infer<typeof WorkstreamExportAgentConfigSchema>
export type WorkstreamExportAgentResult = z.infer<typeof WorkstreamExportAgentResultSchema>

export type CondensedField = {
    readonly type: string
    readonly originalValue: string
    readonly finalValue: string
    readonly confidence: number
    readonly wasCorrected: boolean
    readonly required: boolean
    readonly fieldName: string
}
