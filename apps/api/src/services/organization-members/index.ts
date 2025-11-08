import type { OrganizationMembersRepository } from '../../repositories/organization-members.repo'
import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import type { UsersRepository } from '../../repositories/users.repo'
import { deleteMemberService } from './delete-member'
import { upsertMemberService } from './upsert-member'

export class OrganizationMemberService {
	public readonly upsertMember: ReturnType<typeof upsertMemberService>
	public readonly deleteMember: ReturnType<typeof deleteMemberService>

	constructor(
		organizationMembersRepo: OrganizationMembersRepository,
		organizationsRepo: OrganizationsRepository,
		usersRepo: UsersRepository
	) {
		this.upsertMember = upsertMemberService(organizationMembersRepo, organizationsRepo, usersRepo)
		this.deleteMember = deleteMemberService(organizationMembersRepo, organizationsRepo, usersRepo)
	}
}
