import type { CourtsRepository } from '../../repositories/courts.repo'
import { createCourtService } from './create-court'
import { deleteCourtService } from './delete-court'
import { getCourtService } from './get-court'
import { listCourtsService } from './list-courts'
import { updateCourtService } from './update-court'

export class CourtService {
	public readonly list: ReturnType<typeof listCourtsService>
	public readonly create: ReturnType<typeof createCourtService>
	public readonly update: ReturnType<typeof updateCourtService>
	public readonly delete: ReturnType<typeof deleteCourtService>
	public readonly get: ReturnType<typeof getCourtService>

	constructor(courtsRepo: CourtsRepository) {
		this.list = listCourtsService(courtsRepo)
		this.create = createCourtService(courtsRepo)
		this.update = updateCourtService(courtsRepo)
		this.delete = deleteCourtService(courtsRepo)
		this.get = getCourtService(courtsRepo)
	}
}
