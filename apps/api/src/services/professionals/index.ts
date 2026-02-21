import type { ProfessionalsRepository } from '../../repositories/professionals.repo'
import { createProfessionalService } from './create-professional'
import { deleteProfessionalService } from './delete-professional'
import { getProfessionalService } from './get-professional'
import { listProfessionalsService } from './list-professionals'
import { updateProfessionalService } from './update-professional'

export class ProfessionalService {
	public readonly list: ReturnType<typeof listProfessionalsService>
	public readonly create: ReturnType<typeof createProfessionalService>
	public readonly update: ReturnType<typeof updateProfessionalService>
	public readonly delete: ReturnType<typeof deleteProfessionalService>
	public readonly get: ReturnType<typeof getProfessionalService>

	constructor(professionalsRepo: ProfessionalsRepository) {
		this.list = listProfessionalsService(professionalsRepo)
		this.create = createProfessionalService(professionalsRepo)
		this.update = updateProfessionalService(professionalsRepo)
		this.delete = deleteProfessionalService(professionalsRepo)
		this.get = getProfessionalService(professionalsRepo)
	}
}
