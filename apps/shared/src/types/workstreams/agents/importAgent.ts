import { z } from 'zod'

// Specific configurations for each integration
export const GoogleDriveConfigSchema = z.object({
	type: z.literal('google-drive'),
	folderPath: z.string().optional(),
	folderId: z.string().optional(),
	filePattern: z.string().optional(),
	recursive: z.boolean().optional(),
	refreshToken: z.string().optional(),
	watchedFolderId: z.string().optional(),
	resourceId: z.string().optional(), // For Google Drive webhook
	expiration: z.string().optional(), // Webhook expiration
	uploadCurrentFiles: z.boolean().optional(), // Whether to upload existing files during sync
	userInfo: z
		.object({
			email: z.string(),
			name: z.string(),
			picture: z.string(),
		})
		.optional(),
})

export const EmailConfigSchema = z.object({
	type: z.literal('email'),
	senderEmail: z.email('Must be a valid email address'),
	receiverEmail: z.email('Must be a valid email address').optional(),
	subjectPattern: z.string().optional(),
	requireAttachment: z.boolean().optional(),
	isDemoWorkstream: z.boolean().optional(),
})

export const SalesforceConfigSchema = z.object({
	type: z.literal('salesforce'),
	sfObject: z.string().optional(),
	triggerField: z.string().optional(),
	queryFilter: z.string().optional(),
	schedule: z.enum(['real-time', 'hourly', 'daily']).optional(),
})

export const AffinityConfigSchema = z.object({
	type: z.literal('affinity'),
	affinityEndpoint: z.string().optional(),
	affinityLists: z.string().optional(),
	syncSchedule: z.enum(['real-time', 'hourly', 'daily']).optional(),
	includeNotes: z.boolean().optional(),
})

export const BoxConfigSchema = z.object({
	type: z.literal('box'),
	boxFolder: z.string().optional(),
	boxFileTypes: z.string().optional(),
	boxWebhook: z.enum(['folder-monitor', 'collaboration', 'version-updates']).optional(),
	boxSubfolders: z.boolean().optional(),
})

export const DropboxConfigSchema = z.object({
	type: z.literal('dropbox'),
	dropboxFolder: z.string().optional(),
	dropboxFileTypes: z.string().optional(),
	dropboxWebhook: z.enum(['folder-monitor', 'file-changes', 'sharing-events']).optional(),
	dropboxSubfolders: z.boolean().optional(),
})

// Union of all integration configurations
export const IntegrationConfigSchema = z.discriminatedUnion('type', [
	GoogleDriveConfigSchema,
	EmailConfigSchema,
	SalesforceConfigSchema,
	AffinityConfigSchema,
	BoxConfigSchema,
	DropboxConfigSchema,
])

export const WorkstreamImportAgentConfigSchema = z.object({
	type: z.literal('import'),
	config: z.object({
		selectedSources: z.array(z.string()).optional(),
		selectedSource: z.string().optional(),
		prompt: z.string().optional(),
		integrationConfigs: z.array(IntegrationConfigSchema).optional(),
		configured: z.boolean().optional(),
	}),
})

export const WorkstreamImportAgentResultSchema = z.object({
	type: z.literal('import'),
	result: z.object({
		// TODO: Add result schema
	}),
})

// Tipos TypeScript inferidos dos schemas
export type GoogleDriveConfig = z.infer<typeof GoogleDriveConfigSchema>
export type EmailConfig = z.infer<typeof EmailConfigSchema>
export type SalesforceConfig = z.infer<typeof SalesforceConfigSchema>
export type AffinityConfig = z.infer<typeof AffinityConfigSchema>
export type BoxConfig = z.infer<typeof BoxConfigSchema>
export type DropboxConfig = z.infer<typeof DropboxConfigSchema>
export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>

export type WorkstreamImportAgentConfig = z.infer<typeof WorkstreamImportAgentConfigSchema>
export type WorkstreamImportAgentResult = z.infer<typeof WorkstreamImportAgentResultSchema>
