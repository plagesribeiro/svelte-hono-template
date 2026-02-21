import type { ProfessionalServicesRepository } from '../../repositories/professional-services.repo'

export class ProfessionalServiceLinkService {
	constructor(private readonly professionalServicesRepo: ProfessionalServicesRepository) {}

	async listByProfessional(professionalId: string) {
		const links = await this.professionalServicesRepo.listByProfessional(professionalId)
		return links.map((ls) => ({
			id: ls.id,
			dimProfessionalId: ls.dimProfessionalId,
			dimServiceId: ls.dimServiceId,
			customDurationMinutes: ls.customDurationMinutes,
			customPrice: ls.customPrice ? Number(ls.customPrice) : null,
			service: {
				id: ls.service.id,
				name: ls.service.name,
				description: ls.service.description,
				durationMinutes: ls.service.durationMinutes,
				price: Number(ls.service.price),
				currency: ls.service.currency,
				isActive: ls.service.isActive,
				createdAt: ls.service.createdAt.toISOString(),
				updatedAt: ls.service.updatedAt.toISOString(),
			},
		}))
	}

	async link(input: {
		dimProfessionalId: string
		dimServiceId: string
		customDurationMinutes?: number
		customPrice?: number
	}) {
		const linked = await this.professionalServicesRepo.link(input)
		// Return with service data by re-fetching
		const links = await this.professionalServicesRepo.listByProfessional(input.dimProfessionalId)
		const result = links.find((l) => l.id === linked.id)
		if (!result) {
			throw new Error('Failed to fetch linked professional service')
		}
		return {
			id: result.id,
			dimProfessionalId: result.dimProfessionalId,
			dimServiceId: result.dimServiceId,
			customDurationMinutes: result.customDurationMinutes,
			customPrice: result.customPrice ? Number(result.customPrice) : null,
			service: {
				id: result.service.id,
				name: result.service.name,
				description: result.service.description,
				durationMinutes: result.service.durationMinutes,
				price: Number(result.service.price),
				currency: result.service.currency,
				isActive: result.service.isActive,
				createdAt: result.service.createdAt.toISOString(),
				updatedAt: result.service.updatedAt.toISOString(),
			},
		}
	}

	async unlink(professionalId: string, serviceId: string) {
		await this.professionalServicesRepo.unlink(professionalId, serviceId)
		return { success: true }
	}
}
