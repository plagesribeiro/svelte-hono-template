import type { UsersRepository } from '../../repositories/users.repo'
import { deleteUserByClerkIdService } from './delete-user-by-clerk-id'
import { upsertUserFromClerkService } from './upsert-user-from-clerk'

export class UserService {
    public readonly upsertUserFromClerk: ReturnType<typeof upsertUserFromClerkService>
    public readonly deleteUserByClerkId: ReturnType<typeof deleteUserByClerkIdService>

    constructor(usersRepo: UsersRepository) {
        this.upsertUserFromClerk = upsertUserFromClerkService(usersRepo)
        this.deleteUserByClerkId = deleteUserByClerkIdService(usersRepo)
    }
}
