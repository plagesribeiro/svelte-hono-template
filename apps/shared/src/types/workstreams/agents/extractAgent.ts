import { z } from 'zod'

export const WorkstreamExtractModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gpt-5'] as const
export type WorkstreamExtractModel = (typeof WorkstreamExtractModels)[number]
export const WorkstreamExtractModelNamesAndDescriptions = {
	'gemini-2.5-flash': {
		slug: 'gemini-2.5-flash',
		name: 'Gemini Flash (2.5)',
		description: 'Fast and efficient for most extraction tasks',
	},
	'gemini-2.5-pro': {
		slug: 'gemini-2.5-pro',
		name: 'Gemini Pro (2.5)',
		description: 'More powerful for complex documents and reasoning',
	},
	'gpt-5': {
		slug: 'gpt-5',
		name: 'GPT-5',
		description: 'Most capable OpenAI model for complex reasoning',
	},
} as const

export const WorkstreamExtractFieldTypes = [
	'text',
	'number',
	'date',
	'boolean',
	'array',
	'object',
	'calculation',
	'currency',
] as const
export type WorkstreamExtractFieldType = (typeof WorkstreamExtractFieldTypes)[number]

// Define object schema property type
const ObjectSchemaPropertySchema = z.object({
	key: z.string(),
	type: z.string(),
})

export const WorkstreamExtractAgentConfigFieldsSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		type: z.enum(WorkstreamExtractFieldTypes),
		required: z.boolean().default(true),
		description: z.string(),
		prompt: z.string(),
		arrayType: z.enum(['text', 'number', 'date', 'boolean', 'object', 'currency']).optional(),
		objectSchema: z.array(ObjectSchemaPropertySchema).optional(),
	})
)

export const WorkstreamExtractAgentConfigSchema = z.object({
	type: z.literal('extract'),
	prompt: z.string(),
	models: z.array(z.enum(WorkstreamExtractModels)),
	fields: WorkstreamExtractAgentConfigFieldsSchema,
})

export const WorkstreamExtractAgentResultSchema = z.object({
	type: z.literal('extract'),
	result: z.array(
		z.object({
			model: z.enum(WorkstreamExtractModels),
			fields: z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					extractedValue: z.string(),
					confidence: z.number(),
					error: z.string().optional(),
					sourceText: z.string(),
					page: z.number().optional(),
					textCoordinates: z.string().optional(),
				})
			),
		})
	),
})

export type WorkstreamExtractAgentConfig = z.infer<typeof WorkstreamExtractAgentConfigSchema>
export type WorkstreamExtractAgentResult = z.infer<typeof WorkstreamExtractAgentResultSchema>
