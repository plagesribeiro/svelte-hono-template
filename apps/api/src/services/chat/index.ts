import type { ProcessMessageDeps } from './process-message'
import { processMessageService } from './process-message'

export class ChatService {
	public readonly processMessage: ReturnType<typeof processMessageService>

	constructor(deps: ProcessMessageDeps) {
		this.processMessage = processMessageService(deps)
	}
}
