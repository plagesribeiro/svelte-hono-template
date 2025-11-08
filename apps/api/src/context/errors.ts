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
