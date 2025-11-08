import type { ClerkClient } from '@clerk/backend'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrganizationsRepository } from '../../repositories/organizations.repo'
import type { UsersRepository } from '../../repositories/users.repo'
import { upsertOrganizationFromClerkService } from './upsert-organization-from-clerk'

describe('upsertOrganizationFromClerkService', () => {
	// Mock repositories
	const mockOrganizationsRepo: OrganizationsRepository = {
		upsertOrganization: vi.fn(),
		getOrganizationByClerkId: vi.fn(),
	}

	const mockUsersRepo: UsersRepository = {
		getUserByClerkId: vi.fn(),
		upsertUser: vi.fn(),
		getUserById: vi.fn(),
		getAllUsers: vi.fn(),
		deleteUser: vi.fn(),
	}

	// Mock Clerk client
	const mockClerk = {
		users: {
			getUser: vi.fn(),
		},
	} as unknown as ClerkClient

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('when user exists', () => {
		it('should upsert organization with existing user', async () => {
			// Arrange
			const existingUser = {
				id: 'user-123',
				clerkUserId: 'clerk_user_123',
				email: 'user@example.com',
				name: 'Test User',
				username: 'testuser',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			}

			const expectedOrganization = {
				id: 'org-123',
				clerkOrganizationId: 'clerk_org_123',
				name: 'Test Organization',
				email: 'org@example.com',
				createdBy: existingUser.id,
				lastUpdatedBy: existingUser.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			}

			vi.mocked(mockUsersRepo.getUserByClerkId).mockResolvedValue(existingUser)
			vi.mocked(mockOrganizationsRepo.upsertOrganization).mockResolvedValue(expectedOrganization)

			const service = upsertOrganizationFromClerkService(
				mockOrganizationsRepo,
				mockUsersRepo,
				mockClerk
			)

			// Act
			const result = await service({
				clerkOrganizationId: 'clerk_org_123',
				name: 'Test Organization',
				email: 'org@example.com',
				clerkUserId: 'clerk_user_123',
			})

			// Assert
			expect(mockUsersRepo.getUserByClerkId).toHaveBeenCalledWith('clerk_user_123')
			expect(mockOrganizationsRepo.upsertOrganization).toHaveBeenCalledWith({
				clerkOrganizationId: 'clerk_org_123',
				name: 'Test Organization',
				email: 'org@example.com',
				createdBy: existingUser.id,
				lastUpdatedBy: existingUser.id,
			})
			expect(result).toEqual({ organization: expectedOrganization })
			expect(mockClerk.users.getUser).not.toHaveBeenCalled()
		})
	})

	describe('when user does not exist', () => {
		it('should create user from Clerk and then upsert organization', async () => {
			// Arrange
			const clerkUser = {
				id: 'clerk_user_123',
				primaryEmailAddress: {
					emailAddress: 'newuser@example.com',
				},
				username: 'newuser',
				firstName: 'New',
				lastName: 'User',
			}

			const createdUser = {
				id: 'user-456',
				clerkUserId: 'clerk_user_123',
				email: 'newuser@example.com',
				name: 'New User',
				username: 'newuser',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			}

			const expectedOrganization = {
				id: 'org-456',
				clerkOrganizationId: 'clerk_org_456',
				name: 'New Organization',
				email: 'neworg@example.com',
				createdBy: createdUser.id,
				lastUpdatedBy: createdUser.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			}

			vi.mocked(mockUsersRepo.getUserByClerkId).mockResolvedValue(null)
			vi.mocked(mockClerk.users.getUser).mockResolvedValue(clerkUser as any)
			vi.mocked(mockUsersRepo.upsertUser).mockResolvedValue(createdUser)
			vi.mocked(mockOrganizationsRepo.upsertOrganization).mockResolvedValue(expectedOrganization)

			const service = upsertOrganizationFromClerkService(
				mockOrganizationsRepo,
				mockUsersRepo,
				mockClerk
			)

			// Act
			const result = await service({
				clerkOrganizationId: 'clerk_org_456',
				name: 'New Organization',
				email: 'neworg@example.com',
				clerkUserId: 'clerk_user_123',
			})

			// Assert
			expect(mockUsersRepo.getUserByClerkId).toHaveBeenCalledWith('clerk_user_123')
			expect(mockClerk.users.getUser).toHaveBeenCalledWith('clerk_user_123')
			expect(mockUsersRepo.upsertUser).toHaveBeenCalledWith({
				clerkUserId: 'clerk_user_123',
				email: 'newuser@example.com',
				name: 'New User',
				username: 'newuser',
			})
			expect(mockOrganizationsRepo.upsertOrganization).toHaveBeenCalledWith({
				clerkOrganizationId: 'clerk_org_456',
				name: 'New Organization',
				email: 'neworg@example.com',
				createdBy: createdUser.id,
				lastUpdatedBy: createdUser.id,
			})
			expect(result).toEqual({ organization: expectedOrganization })
		})

		it('should throw error when Clerk user is not found', async () => {
			// Arrange
			vi.mocked(mockUsersRepo.getUserByClerkId).mockResolvedValue(null)
			vi.mocked(mockClerk.users.getUser).mockResolvedValue(null as any)

			const service = upsertOrganizationFromClerkService(
				mockOrganizationsRepo,
				mockUsersRepo,
				mockClerk
			)

			// Act & Assert
			await expect(
				service({
					clerkOrganizationId: 'clerk_org_789',
					name: 'Test Org',
					email: 'test@example.com',
					clerkUserId: 'clerk_user_nonexistent',
				})
			).rejects.toThrow('Clerk user not found')
		})

		it('should throw error when Clerk user has no primary email', async () => {
			// Arrange
			const clerkUserWithoutEmail = {
				id: 'clerk_user_123',
				primaryEmailAddress: null,
				username: 'userwithoutemail',
				firstName: 'No',
				lastName: 'Email',
			}

			vi.mocked(mockUsersRepo.getUserByClerkId).mockResolvedValue(null)
			vi.mocked(mockClerk.users.getUser).mockResolvedValue(clerkUserWithoutEmail as any)

			const service = upsertOrganizationFromClerkService(
				mockOrganizationsRepo,
				mockUsersRepo,
				mockClerk
			)

			// Act & Assert
			await expect(
				service({
					clerkOrganizationId: 'clerk_org_789',
					name: 'Test Org',
					email: 'test@example.com',
					clerkUserId: 'clerk_user_123',
				})
			).rejects.toThrow('Clerk user has no primary email address')
		})

		it('should use email as username when username is not provided', async () => {
			// Arrange
			const clerkUser = {
				id: 'clerk_user_123',
				primaryEmailAddress: {
					emailAddress: 'nousername@example.com',
				},
				username: null,
				firstName: 'No',
				lastName: 'Username',
			}

			const createdUser = {
				id: 'user-789',
				clerkUserId: 'clerk_user_123',
				email: 'nousername@example.com',
				name: 'No Username',
				username: 'nousername@example.com',
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			}

			const expectedOrganization = {
				id: 'org-789',
				clerkOrganizationId: 'clerk_org_789',
				name: 'Test Organization',
				email: 'test@example.com',
				createdBy: createdUser.id,
				lastUpdatedBy: createdUser.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: null,
			}

			vi.mocked(mockUsersRepo.getUserByClerkId).mockResolvedValue(null)
			vi.mocked(mockClerk.users.getUser).mockResolvedValue(clerkUser as any)
			vi.mocked(mockUsersRepo.upsertUser).mockResolvedValue(createdUser)
			vi.mocked(mockOrganizationsRepo.upsertOrganization).mockResolvedValue(expectedOrganization)

			const service = upsertOrganizationFromClerkService(
				mockOrganizationsRepo,
				mockUsersRepo,
				mockClerk
			)

			// Act
			await service({
				clerkOrganizationId: 'clerk_org_789',
				name: 'Test Organization',
				email: 'test@example.com',
				clerkUserId: 'clerk_user_123',
			})

			// Assert
			expect(mockUsersRepo.upsertUser).toHaveBeenCalledWith({
				clerkUserId: 'clerk_user_123',
				email: 'nousername@example.com',
				name: 'No Username',
				username: 'nousername@example.com', // Email used as username
			})
		})
	})
})
