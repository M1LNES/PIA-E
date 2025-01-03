import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../utils/test-interface'
import { Role, UserWithPermissions } from '../utils/dtos'
import { RoleDomain } from '@/dto/types'

jest.mock('@/app/api/utils/queries', () => ({
	__esModule: true,
	getAllRoles: jest.fn(),
	getUserWithPermissions: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('GET /api/roles', () => {
	it('should return roles when user has sufficient permissions', async () => {
		// Mock session and user permissions
		const mockSession = {
			user: {
				email: 'user@example.com',
			},
		}

		const mockUser: UserWithPermissions = {
			email: 'user@example.com',
			role: 1,
			permission: 80, // admin permission
		}

		const mockRoles: Role[] = [
			{ id: 1, type: 'admin', permission: 80 },
			{ id: 2, type: 'reader', permission: 20 },
			{ id: 3, type: 'writer', permission: 40 },
			{ id: 4, type: 'superadmin', permission: 100 },
		]

		const rolesOutput: RoleDomain[] = [
			{ roleId: 1, roleType: 'admin', rolePermission: 80 },
			{ roleId: 2, roleType: 'reader', rolePermission: 20 },
			{ roleId: 3, roleType: 'writer', rolePermission: 40 },
			{ roleId: 4, roleType: 'superadmin', rolePermission: 100 },
		]

		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getAllRoles as jest.Mock).mockResolvedValue(mockRoles)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(200)
				expect(result.roles).toEqual(rolesOutput)
			},
		})
	})

	it('should return 401 when session is missing', async () => {
		// Mock missing session
		;(getServerSession as jest.Mock).mockResolvedValue(null)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(401)
				expect(result.error).toBe('Unauthorized!')
			},
		})
	})

	it('should return 403 when user has insufficient permissions', async () => {
		// Mock session and user with insufficient permissions
		const mockSession = {
			user: {
				email: 'user@example.com',
			},
		}

		const mockUser: UserWithPermissions = {
			email: 'user@example.com',
			role: 3,
			permission: 20, // reader permission
		}

		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 500 when an error occurs while fetching roles', async () => {
		// Mock session and user permissions
		const mockSession = {
			user: {
				email: 'user@example.com',
			},
		}

		const mockUser: UserWithPermissions = {
			email: 'user@example.com',
			role: 1,
			permission: 80, // admin permission
		}

		// Simulate an error when fetching roles
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getAllRoles as jest.Mock).mockRejectedValue(
			new Error('Database error')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal Server Error')
			},
		})
	})
})
