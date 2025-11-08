/**
 * Slack messaging types for system notifications with Block Kit support
 */

// Block Kit compatible types
export interface SlackBlock {
	type: string
	[key: string]: unknown
}

export interface SlackHeaderBlock extends SlackBlock {
	type: 'header'
	text: {
		type: 'plain_text'
		text: string
		emoji?: boolean
	}
}

export interface SlackSectionBlock extends SlackBlock {
	type: 'section'
	text?: {
		type: 'mrkdwn' | 'plain_text'
		text: string
	}
	fields?: Array<{
		type: 'mrkdwn' | 'plain_text'
		text: string
	}>
	accessory?: SlackBlockElement
}

export interface SlackContextBlock extends SlackBlock {
	type: 'context'
	elements: Array<{
		type: 'mrkdwn' | 'plain_text'
		text: string
	}>
}

export interface SlackDividerBlock extends SlackBlock {
	type: 'divider'
}

export interface SlackButtonElement {
	type: 'button'
	text: {
		type: 'plain_text'
		text: string
		emoji?: boolean
	}
	value?: string
	url?: string
	action_id?: string
	style?: 'primary' | 'danger'
}

export type SlackBlockElement = SlackButtonElement

export interface SlackMessageData {
	channel: string
	content?: string // For fallback text
	blocks?: SlackBlock[]
	metadata?: Record<string, unknown>
	priority?: 'low' | 'normal' | 'high' | 'critical'
	timestamp?: string
	userId?: string
	organizationId?: string
	threadTs?: string // For threading messages
}

export interface SlackChannelConfig {
	documents: string // document uploads and operations
	processing: string // queue, classification, extraction
	errors: string // all errors and failures
	workflows: string // workflow execution
}

export interface SlackServiceConfig {
	botToken?: string
	webhookUrl?: string // Fallback for environments without bot token
	channels: SlackChannelConfig
	enabled: boolean
	environment: 'development' | 'staging' | 'production'
	useBlockKit?: boolean // Enable Block Kit formatting
	enableThreading?: boolean // Enable message threading
}

export enum SlackMessagePriority {
	LOW = 'low',
	NORMAL = 'normal',
	HIGH = 'high',
	CRITICAL = 'critical',
}
