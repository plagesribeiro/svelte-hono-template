import { Logger } from '../../utils/logger'
import type { AvailabilityService } from '../availability'
import type { BookingsService } from '../bookings'
import type { ClientService } from '../clients'
import type { CourtService } from '../courts'
import type { ProfessionalServiceLinkService } from '../professional-services'
import type { ProfessionalService } from '../professionals'
import type { ServiceEntityService } from '../services'

type ToolDeps = {
	orgId: string
	orgBusinessHours: unknown
	businessType: string
	chatSessionId: string
	availability: AvailabilityService
	bookings: BookingsService
	clients: ClientService
	professionals: ProfessionalService
	serviceEntities: ServiceEntityService
	professionalServiceLinks: ProfessionalServiceLinkService
	courts: CourtService
}

export async function executeToolCall(
	toolName: string,
	toolInput: Record<string, unknown>,
	deps: ToolDeps
): Promise<string> {
	Logger.info('Executing tool call', { toolName, toolInput })

	try {
		switch (toolName) {
			case 'check_availability': {
				const result = await deps.availability.getAvailableSlots({
					orgId: deps.orgId,
					orgBusinessHours: deps.orgBusinessHours as Parameters<
						typeof deps.availability.getAvailableSlots
					>[0]['orgBusinessHours'],
					date: toolInput.date as string,
					professionalId: toolInput.professional_id as string | undefined,
					serviceId: toolInput.service_id as string | undefined,
					courtId: toolInput.court_id as string | undefined,
					businessType: deps.businessType,
				})
				if (result.slots.length === 0) {
					return JSON.stringify({ message: 'Nenhum horario disponivel nesta data.' })
				}
				return JSON.stringify({
					available_slots: result.slots.map((s) => ({
						start: s.startTime,
						end: s.endTime,
						professional: s.professionalName,
						court: s.courtName,
					})),
				})
			}

			case 'create_booking': {
				// Upsert client first
				const client = await deps.clients.upsert({
					orgId: deps.orgId,
					name: toolInput.client_name as string,
					phone: toolInput.client_phone as string,
				})

				const booking = await deps.bookings.create(deps.orgId, {
					dimClientId: client.id,
					dimProfessionalId: toolInput.professional_id as string | undefined,
					dimServiceId: toolInput.service_id as string | undefined,
					dimCourtId: toolInput.court_id as string | undefined,
					startTime: toolInput.start_time as string,
					endTime: toolInput.end_time as string,
					dimChatSessionId: deps.chatSessionId,
				})

				return JSON.stringify({
					success: true,
					booking_id: booking.id,
					message: `Agendamento confirmado para ${toolInput.client_name} em ${new Date(toolInput.start_time as string).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
				})
			}

			case 'cancel_booking': {
				await deps.bookings.cancel(
					toolInput.booking_id as string,
					toolInput.reason as string | undefined
				)
				return JSON.stringify({
					success: true,
					message: 'Agendamento cancelado com sucesso.',
				})
			}

			case 'reschedule_booking': {
				await deps.bookings.reschedule(
					toolInput.booking_id as string,
					toolInput.new_start_time as string,
					toolInput.new_end_time as string
				)
				return JSON.stringify({
					success: true,
					message: `Agendamento reagendado para ${new Date(toolInput.new_start_time as string).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
				})
			}

			case 'list_services': {
				const services = await deps.serviceEntities.list(deps.orgId)
				return JSON.stringify(
					services.map((s) => ({
						id: s.id,
						name: s.name,
						description: s.description,
						duration_minutes: s.durationMinutes,
						price: `R$${(s.price / 100).toFixed(2)}`,
					}))
				)
			}

			case 'list_professionals': {
				const pros = await deps.professionals.list(deps.orgId)
				return JSON.stringify(
					pros.map((p) => ({
						id: p.id,
						name: p.name,
						phone: p.phone,
					}))
				)
			}

			case 'list_courts': {
				const courts = await deps.courts.list(deps.orgId)
				return JSON.stringify(
					courts.map((c) => ({
						id: c.id,
						name: c.name,
						sport: c.sport,
						slot_duration: c.slotDurationMinutes,
						price: `R$${(c.pricePerSlot / 100).toFixed(2)}`,
					}))
				)
			}

			default:
				return JSON.stringify({ error: `Ferramenta desconhecida: ${toolName}` })
		}
	} catch (error) {
		Logger.error('Tool execution error', error instanceof Error ? error : new Error(String(error)))
		return JSON.stringify({
			error: error instanceof Error ? error.message : 'Erro ao executar ferramenta',
		})
	}
}
