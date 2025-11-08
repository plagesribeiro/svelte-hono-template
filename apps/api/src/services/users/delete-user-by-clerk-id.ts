import type { UsersRepository } from '../../repositories/users.repo'
import { Logger } from '../../utils/logger'

export function deleteUserByClerkIdService(usersRepo: UsersRepository) {
	return async (clerkUserId: string) => {
		Logger.info('Deleting user by Clerk ID', { clerkUserId })

		await usersRepo.deleteUserByClerkId(clerkUserId)

		Logger.info('User deleted successfully', { clerkUserId })
	}
}
