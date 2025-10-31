import type { ClerkClient } from '@clerk/backend'
import type { DbClient } from 'db'
import { OrganizationMembersRepository } from '../repositories/organization-members.repo'
import { OrganizationsRepository } from '../repositories/organizations.repo'
import { UsersRepository } from '../repositories/users.repo'
import { OrganizationMemberService } from '../services/organization-members'
import { OrganizationService } from '../services/organizations'
import { UserService } from '../services/users'


export class ServiceContainer {
    // Repositories (always initialized)
    private readonly usersRepo: UsersRepository
    private readonly organizationsRepo: OrganizationsRepository
    private readonly organizationMembersRepo: OrganizationMembersRepository

    // Common services (always initialized)
    public readonly clerk: ClerkClient

    // Domain services (lazy-initialized via getters)
    private _users?: UserService
    private _organizations?: OrganizationService
    private _organizationMembers?: OrganizationMemberService

    constructor(
        readonly db: DbClient,
        readonly env: Cloudflare.Env,
        readonly clerkClent: ClerkClient,
    ) {
        this.clerk = clerkClent
        // Initialize repositories immediately
        this.usersRepo = new UsersRepository(db)
        this.organizationsRepo = new OrganizationsRepository(db)
        this.organizationMembersRepo = new OrganizationMembersRepository(db)

    }

    get users(): UserService {
        if (!this._users) {
            this._users = new UserService(this.usersRepo)
        }
        return this._users
    }

    get organizations(): OrganizationService {
        if (!this._organizations) {
            this._organizations = new OrganizationService(this.organizationsRepo, this.usersRepo, this.clerk)
        }
        return this._organizations
    }

    get organizationMembers(): OrganizationMemberService {
        if (!this._organizationMembers) {
            this._organizationMembers = new OrganizationMemberService(
                this.organizationMembersRepo,
                this.organizationsRepo,
                this.usersRepo,
            )
        }
        return this._organizationMembers
    }
}
