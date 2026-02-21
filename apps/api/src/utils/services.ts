import type { ClerkClient } from '@clerk/backend'
import type { DbClient } from 'db'
import { BookingsRepository } from '../repositories/bookings.repo'
import { ChatMessagesRepository } from '../repositories/chat-messages.repo'
import { ChatSessionsRepository } from '../repositories/chat-sessions.repo'
import { ClientsRepository } from '../repositories/clients.repo'
import { CourtsRepository } from '../repositories/courts.repo'
import { OrganizationMembersRepository } from '../repositories/organization-members.repo'
import { OrganizationsRepository } from '../repositories/organizations.repo'
import { ProfessionalServicesRepository } from '../repositories/professional-services.repo'
import { ProfessionalsRepository } from '../repositories/professionals.repo'
import { ServicesRepository } from '../repositories/services.repo'
import { UsersRepository } from '../repositories/users.repo'
import { AvailabilityService } from '../services/availability'
import { BookingsService } from '../services/bookings'
import { ChatService } from '../services/chat'
import { ClientService } from '../services/clients'
import { CourtService } from '../services/courts'
import { OrganizationConfigService } from '../services/organization-config'
import { OrganizationMemberService } from '../services/organization-members'
import { OrganizationService } from '../services/organizations'
import { ProfessionalServiceLinkService } from '../services/professional-services'
import { ProfessionalService } from '../services/professionals'
import { ServiceEntityService } from '../services/services'
import { UserService } from '../services/users'

export class ServiceContainer {
	// Repositories (always initialized)
	private readonly usersRepo: UsersRepository
	private readonly organizationsRepo: OrganizationsRepository
	private readonly organizationMembersRepo: OrganizationMembersRepository
	private readonly professionalsRepo: ProfessionalsRepository
	private readonly servicesRepo: ServicesRepository
	private readonly professionalServicesRepo: ProfessionalServicesRepository
	private readonly courtsRepo: CourtsRepository
	private readonly clientsRepo: ClientsRepository
	private readonly bookingsRepo: BookingsRepository
	private readonly chatSessionsRepo: ChatSessionsRepository
	private readonly chatMessagesRepo: ChatMessagesRepository

	// Common services (always initialized)
	public readonly clerk: ClerkClient

	// Domain services (lazy-initialized via getters)
	private _users?: UserService
	private _organizations?: OrganizationService
	private _organizationMembers?: OrganizationMemberService
	private _professionals?: ProfessionalService
	private _serviceEntities?: ServiceEntityService
	private _professionalServiceLinks?: ProfessionalServiceLinkService
	private _courts?: CourtService
	private _clients?: ClientService
	private _organizationConfig?: OrganizationConfigService
	private _bookings?: BookingsService
	private _availability?: AvailabilityService
	private _chat?: ChatService

	constructor(
		readonly db: DbClient,
		readonly env: Cloudflare.Env,
		readonly clerkClent: ClerkClient
	) {
		this.clerk = clerkClent
		// Initialize repositories immediately
		this.usersRepo = new UsersRepository(db)
		this.organizationsRepo = new OrganizationsRepository(db)
		this.organizationMembersRepo = new OrganizationMembersRepository(db)
		this.professionalsRepo = new ProfessionalsRepository(db)
		this.servicesRepo = new ServicesRepository(db)
		this.professionalServicesRepo = new ProfessionalServicesRepository(db)
		this.courtsRepo = new CourtsRepository(db)
		this.clientsRepo = new ClientsRepository(db)
		this.bookingsRepo = new BookingsRepository(db)
		this.chatSessionsRepo = new ChatSessionsRepository(db)
		this.chatMessagesRepo = new ChatMessagesRepository(db)
	}

	get users(): UserService {
		if (!this._users) {
			this._users = new UserService(this.usersRepo)
		}
		return this._users
	}

	get organizations(): OrganizationService {
		if (!this._organizations) {
			this._organizations = new OrganizationService(
				this.organizationsRepo,
				this.usersRepo,
				this.clerk
			)
		}
		return this._organizations
	}

	get organizationMembers(): OrganizationMemberService {
		if (!this._organizationMembers) {
			this._organizationMembers = new OrganizationMemberService(
				this.organizationMembersRepo,
				this.organizationsRepo,
				this.usersRepo
			)
		}
		return this._organizationMembers
	}

	get professionals(): ProfessionalService {
		if (!this._professionals) {
			this._professionals = new ProfessionalService(this.professionalsRepo)
		}
		return this._professionals
	}

	get serviceEntities(): ServiceEntityService {
		if (!this._serviceEntities) {
			this._serviceEntities = new ServiceEntityService(this.servicesRepo)
		}
		return this._serviceEntities
	}

	get professionalServiceLinks(): ProfessionalServiceLinkService {
		if (!this._professionalServiceLinks) {
			this._professionalServiceLinks = new ProfessionalServiceLinkService(
				this.professionalServicesRepo
			)
		}
		return this._professionalServiceLinks
	}

	get courts(): CourtService {
		if (!this._courts) {
			this._courts = new CourtService(this.courtsRepo)
		}
		return this._courts
	}

	get clients(): ClientService {
		if (!this._clients) {
			this._clients = new ClientService(this.clientsRepo)
		}
		return this._clients
	}

	get organizationConfig(): OrganizationConfigService {
		if (!this._organizationConfig) {
			this._organizationConfig = new OrganizationConfigService(this.organizationsRepo)
		}
		return this._organizationConfig
	}

	get bookings(): BookingsService {
		if (!this._bookings) {
			this._bookings = new BookingsService(this.bookingsRepo)
		}
		return this._bookings
	}

	get availability(): AvailabilityService {
		if (!this._availability) {
			this._availability = new AvailabilityService({
				professionalsRepo: this.professionalsRepo,
				professionalServicesRepo: this.professionalServicesRepo,
				servicesRepo: this.servicesRepo,
				courtsRepo: this.courtsRepo,
				bookingsRepo: this.bookingsRepo,
			})
		}
		return this._availability
	}

	get chat(): ChatService {
		if (!this._chat) {
			this._chat = new ChatService({
				chatSessionsRepo: this.chatSessionsRepo,
				chatMessagesRepo: this.chatMessagesRepo,
				professionalsRepo: this.professionalsRepo,
				professionalServicesRepo: this.professionalServicesRepo,
				servicesRepo: this.servicesRepo,
				courtsRepo: this.courtsRepo,
				availability: this.availability,
				bookings: this.bookings,
				clients: this.clients,
				professionals: this.professionals,
				serviceEntities: this.serviceEntities,
				professionalServiceLinks: this.professionalServiceLinks,
				courts: this.courts,
			})
		}
		return this._chat
	}

	// Expose repositories that other services may need directly
	get usersRepository(): UsersRepository {
		return this.usersRepo
	}

	get organizationsRepository(): OrganizationsRepository {
		return this.organizationsRepo
	}

	get bookingsRepository(): BookingsRepository {
		return this.bookingsRepo
	}

	get chatSessionsRepository(): ChatSessionsRepository {
		return this.chatSessionsRepo
	}

	get chatMessagesRepository(): ChatMessagesRepository {
		return this.chatMessagesRepo
	}
}
