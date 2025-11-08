import type { UsersRepository } from '../../repositories/users.repo'
import { Logger } from '../../utils/logger'

export function upsertUserFromClerkService(usersRepo: UsersRepository) {
	return async (input: { clerkUserId: string; email: string; name: string; username: string }) => {
		const { clerkUserId, email, name, username } = input

		Logger.info('Upserting user from Clerk', { clerkUserId, email, username })

		const user = await usersRepo.upsertUser({
			clerkUserId,
			email,
			name,
			username,
		})

		Logger.info('User upserted successfully', { userId: user.id, clerkUserId })

		return { user }
	}
}
