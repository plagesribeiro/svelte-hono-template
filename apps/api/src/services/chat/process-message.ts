import { ChatRateLimitError } from '../../context/errors'
import type { ChatMessagesRepository } from '../../repositories/chat-messages.repo'
import type { ChatSessionsRepository } from '../../repositories/chat-sessions.repo'
import type { CourtsRepository } from '../../repositories/courts.repo'
import type { ProfessionalServicesRepository } from '../../repositories/professional-services.repo'
import type { ProfessionalsRepository } from '../../repositories/professionals.repo'
import type { ServicesRepository } from '../../repositories/services.repo'
import type { AvailabilityService } from '../availability'
import type { BookingsService } from '../bookings'
import type { ClientService } from '../clients'
import type { CourtService } from '../courts'
import type { ProfessionalServiceLinkService } from '../professional-services'
import type { ProfessionalService } from '../professionals'
import type { ServiceEntityService } from '../services'
import { buildSystemPrompt } from './build-system-prompt'
import type { ContentBlock, Message } from './call-claude'
import { callClaude } from './call-claude'
import { executeToolCall } from './execute-tool-call'
import { chatTools } from './tool-definitions'

const RATE_LIMIT_MAX_MESSAGES = 30
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export type ProcessMessageDeps = {
	chatSessionsRepo: ChatSessionsRepository
	chatMessagesRepo: ChatMessagesRepository
	professionalsRepo: ProfessionalsRepository
	professionalServicesRepo: ProfessionalServicesRepository
	servicesRepo: ServicesRepository
	courtsRepo: CourtsRepository
	availability: AvailabilityService
	bookings: BookingsService
	clients: ClientService
	professionals: ProfessionalService
	serviceEntities: ServiceEntityService
	professionalServiceLinks: ProfessionalServiceLinkService
	courts: CourtService
}

export function processMessageService(deps: ProcessMessageDeps) {
	return async (input: {
		sessionId: string
		message: string
		apiKey: string
		org: {
			id: string
			name: string
			businessType: string
			businessHours: unknown
			chatInstructions: string | null
		}
	}): Promise<string> => {
		const { sessionId, message, apiKey, org } = input

		// 1. Get session & rate limit
		const session = await deps.chatSessionsRepo.getById(sessionId)
		if (!session) throw new Error('Chat session not found')

		const now = new Date()
		let messageCount = session.messageCount
		let windowStartedAt = session.windowStartedAt

		if (windowStartedAt && now.getTime() - windowStartedAt.getTime() > RATE_LIMIT_WINDOW_MS) {
			messageCount = 0
			windowStartedAt = now
		} else if (!windowStartedAt) {
			windowStartedAt = now
		}

		if (messageCount >= RATE_LIMIT_MAX_MESSAGES) {
			throw new ChatRateLimitError()
		}

		await deps.chatSessionsRepo.updateMessageCount(sessionId, messageCount + 1, windowStartedAt)

		// 2. Save user message
		await deps.chatMessagesRepo.create({
			dimChatSessionId: sessionId,
			role: 'user',
			content: message,
		})

		// 3. Build context
		let professionals:
			| {
					id: string
					name: string
					services: {
						id: string
						name: string
						durationMinutes: number
						price: number
					}[]
			  }[]
			| undefined
		let courts:
			| {
					id: string
					name: string
					sport: string
					slotDurationMinutes: number
					pricePerSlot: number
			  }[]
			| undefined

		if (org.businessType === 'barbershop') {
			const pros = await deps.professionalsRepo.list(org.id)
			professionals = await Promise.all(
				pros
					.filter((p) => p.isActive)
					.map(async (p) => {
						const links = await deps.professionalServicesRepo.listByProfessional(p.id)
						return {
							id: p.id,
							name: p.name,
							services: links.map((l) => ({
								id: l.service.id,
								name: l.service.name,
								durationMinutes: l.customDurationMinutes ?? l.service.durationMinutes,
								price: l.customPrice ? Number(l.customPrice) : Number(l.service.price),
							})),
						}
					})
			)
		} else {
			const courtList = await deps.courtsRepo.list(org.id)
			courts = courtList
				.filter((c) => c.isActive)
				.map((c) => ({
					id: c.id,
					name: c.name,
					sport: c.sport,
					slotDurationMinutes: c.slotDurationMinutes,
					pricePerSlot: c.pricePerSlot,
				}))
		}

		const systemPrompt = buildSystemPrompt({
			orgName: org.name,
			businessType: org.businessType,
			professionals,
			courts,
			businessHours:
				(org.businessHours as {
					dayOfWeek: number
					openTime: string
					closeTime: string
					isOpen: boolean
				}[]) ?? [],
			chatInstructions: org.chatInstructions,
		})

		// 4. Load chat history
		const history = await deps.chatMessagesRepo.listBySession(sessionId)
		// Exclude the user message we just saved (it's the last one) - we'll add it manually
		const previousHistory = history.slice(0, -1)
		const messages = convertHistoryToMessages(previousHistory)

		// Add current user message
		messages.push({ role: 'user' as const, content: message })

		// 5. Tool use loop
		let maxIterations = 5
		let finalResponse = ''

		while (maxIterations > 0) {
			maxIterations--

			const response = await callClaude({
				apiKey,
				systemPrompt,
				messages,
				tools: chatTools,
			})

			// Collect text from response
			const textParts = response.content
				.filter((b): b is Extract<ContentBlock, { type: 'text' }> => b.type === 'text')
				.map((b) => b.text)

			const toolUseBlocks = response.content.filter(
				(b): b is Extract<ContentBlock, { type: 'tool_use' }> => b.type === 'tool_use'
			)

			// Save assistant message
			await deps.chatMessagesRepo.create({
				dimChatSessionId: sessionId,
				role: 'assistant',
				content: textParts.join('') || null,
				toolName: toolUseBlocks[0]?.name ?? null,
				toolInput: toolUseBlocks[0]?.input ?? null,
			})

			// If stop_reason is 'end_turn', we're done
			if (response.stop_reason === 'end_turn') {
				finalResponse = textParts.join('')
				break
			}

			// If stop_reason is 'tool_use', execute tools and continue
			if (response.stop_reason === 'tool_use') {
				messages.push({
					role: 'assistant',
					content: response.content as ContentBlock[],
				})

				const toolResults: ContentBlock[] = []
				for (const block of toolUseBlocks) {
					const result = await executeToolCall(block.name, block.input as Record<string, unknown>, {
						orgId: org.id,
						orgBusinessHours: org.businessHours,
						businessType: org.businessType,
						chatSessionId: sessionId,
						availability: deps.availability,
						bookings: deps.bookings,
						clients: deps.clients,
						professionals: deps.professionals,
						serviceEntities: deps.serviceEntities,
						professionalServiceLinks: deps.professionalServiceLinks,
						courts: deps.courts,
					})

					// Save tool result message
					await deps.chatMessagesRepo.create({
						dimChatSessionId: sessionId,
						role: 'tool_result',
						toolName: block.name,
						toolResult: JSON.parse(result),
					})

					toolResults.push({
						type: 'tool_result',
						tool_use_id: block.id,
						content: result,
					})
				}

				messages.push({ role: 'user', content: toolResults })
				finalResponse = '' // Reset - Claude will provide new response after tool results
			}
		}

		return finalResponse
	}
}

function convertHistoryToMessages(
	history: {
		role: string
		content: string | null
		toolName: string | null
		toolInput: unknown
		toolResult: unknown
	}[]
): Message[] {
	const messages: Message[] = []

	for (const msg of history) {
		if (msg.role === 'user') {
			messages.push({ role: 'user', content: msg.content ?? '' })
		} else if (msg.role === 'assistant') {
			// If assistant message had tool use, we need to reconstruct the content blocks
			if (msg.toolName) {
				const content: ContentBlock[] = []
				if (msg.content) {
					content.push({ type: 'text', text: msg.content })
				}
				content.push({
					type: 'tool_use',
					id: `tool_${Date.now()}_${Math.random().toString(36).slice(2)}`,
					name: msg.toolName,
					input: (msg.toolInput as Record<string, unknown>) ?? {},
				})
				messages.push({ role: 'assistant', content })
			} else {
				messages.push({ role: 'assistant', content: msg.content ?? '' })
			}
		} else if (msg.role === 'tool_result') {
			// Tool results are paired with previous assistant tool_use
			// They should be added as user messages in Claude format
			const lastMsg = messages[messages.length - 1]
			if (lastMsg?.role === 'assistant') {
				const lastContent = lastMsg.content
				const toolUseBlock = Array.isArray(lastContent)
					? lastContent.find(
							(b): b is Extract<ContentBlock, { type: 'tool_use' }> => b.type === 'tool_use'
						)
					: null
				if (toolUseBlock) {
					messages.push({
						role: 'user',
						content: [
							{
								type: 'tool_result',
								tool_use_id: toolUseBlock.id,
								content: JSON.stringify(msg.toolResult),
							},
						],
					})
				}
			}
		}
	}

	return messages
}
