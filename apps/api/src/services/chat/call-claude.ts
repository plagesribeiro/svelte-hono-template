import { Logger } from '../../utils/logger'

type ContentBlock =
	| { type: 'text'; text: string }
	| { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
	| { type: 'tool_result'; tool_use_id: string; content: string }

type Message = {
	role: 'user' | 'assistant'
	content: string | ContentBlock[]
}

type ClaudeResponse = {
	id: string
	type: 'message'
	role: 'assistant'
	content: ContentBlock[]
	model: string
	stop_reason: 'end_turn' | 'tool_use' | 'max_tokens'
	usage: { input_tokens: number; output_tokens: number }
}

export type { ContentBlock, Message, ClaudeResponse }

export async function callClaude(input: {
	apiKey: string
	systemPrompt: string
	messages: Message[]
	tools: unknown[]
}): Promise<ClaudeResponse> {
	const { apiKey, systemPrompt, messages, tools } = input

	Logger.info('Calling Claude API', { messageCount: messages.length })

	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01',
		},
		body: JSON.stringify({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 1024,
			system: systemPrompt,
			messages,
			tools,
		}),
	})

	if (!response.ok) {
		const errorBody = await response.text()
		Logger.error('Claude API error', { status: response.status, body: errorBody })
		throw new Error(`Claude API error: ${response.status} - ${errorBody}`)
	}

	const result = (await response.json()) as ClaudeResponse
	Logger.info('Claude API response', {
		stopReason: result.stop_reason,
		contentBlocks: result.content.length,
	})

	return result
}
