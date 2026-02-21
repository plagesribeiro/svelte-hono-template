// Re-export Logger from utils
export { Logger } from '../utils/logger'

// Custom error classes
export class OrganizationNotFoundError extends Error {
	constructor(message = 'Organization not found') {
		super(message)
		this.name = 'OrganizationNotFoundError'
	}
}

export class UserNotFoundError extends Error {
	constructor(message = 'User not found') {
		super(message)
		this.name = 'UserNotFoundError'
	}
}

export class MemberNotFoundError extends Error {
	constructor(message = 'Member not found') {
		super(message)
		this.name = 'MemberNotFoundError'
	}
}

export class UnauthorizedError extends Error {
	constructor(message = 'Unauthorized') {
		super(message)
		this.name = 'UnauthorizedError'
	}
}

export class ProfessionalNotFoundError extends Error {
	constructor(message = 'Professional not found') {
		super(message)
		this.name = 'ProfessionalNotFoundError'
	}
}

export class ServiceNotFoundError extends Error {
	constructor(message = 'Service not found') {
		super(message)
		this.name = 'ServiceNotFoundError'
	}
}

export class CourtNotFoundError extends Error {
	constructor(message = 'Court not found') {
		super(message)
		this.name = 'CourtNotFoundError'
	}
}

export class ClientNotFoundError extends Error {
	constructor(message = 'Client not found') {
		super(message)
		this.name = 'ClientNotFoundError'
	}
}

export class BookingNotFoundError extends Error {
	constructor(message = 'Booking not found') {
		super(message)
		this.name = 'BookingNotFoundError'
	}
}

export class BookingConflictError extends Error {
	constructor(message = 'Booking conflicts with existing booking') {
		super(message)
		this.name = 'BookingConflictError'
	}
}

export class SlotNotAvailableError extends Error {
	constructor(message = 'Slot is not available') {
		super(message)
		this.name = 'SlotNotAvailableError'
	}
}

export class ChatRateLimitError extends Error {
	constructor(message = 'Chat rate limit exceeded') {
		super(message)
		this.name = 'ChatRateLimitError'
	}
}
