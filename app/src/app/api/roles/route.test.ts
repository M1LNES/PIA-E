import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../public/test-interface'

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

		const mockUser = {
			email: 'user@example.com',
			role: 1,
			permission: 80, // admin permission
		}

		const mockRoles = [
			{ id: 1, name: 'admin', permission: 80 },
			{ id: 2, name: 'reader', permission: 20 },
			{ id: 3, name: 'writer', permission: 40 },
			{ id: 4, name: 'superadmin', permission: 100 },
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
				expect(result.roles).toEqual(mockRoles)
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

		const mockUser = {
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

		const mockUser = {
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
