import type { ClerkClient } from '@clerk/backend'
import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import type { UsersRepository } from '../../repositories/users.repo'
import { deleteOrganizationByClerkIdService } from './delete-organization-by-clerk-id'
import { upsertOrganizationFromClerkService } from './upsert-organization-from-clerk'

export class OrganizationService {
	public readonly upsertOrganizationFromClerk: ReturnType<typeof upsertOrganizationFromClerkService>
	public readonly deleteOrganizationByClerkId: ReturnType<typeof deleteOrganizationByClerkIdService>

	constructor(
		organizationsRepo: OrganizationsRepository,
		usersRepo: UsersRepository,
		clerk: ClerkClient
	) {
		this.upsertOrganizationFromClerk = upsertOrganizationFromClerkService(
			organizationsRepo,
			usersRepo,
			clerk
		)
		this.deleteOrganizationByClerkId = deleteOrganizationByClerkIdService(organizationsRepo)
	}
}
