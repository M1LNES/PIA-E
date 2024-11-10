import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../../public/test-interface'

jest.mock('@/app/api/queries', () => ({
	__esModule: true,
	getUserWithPermissions: jest.fn(),
	getAllUsersWithRoles: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('GET /api/users/get-all-users', () => {
	it('should return 401 if session is missing', async () => {
		;(getServerSession as jest.Mock).mockResolvedValue(null)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(401)
				expect(result.error).toBe('Unauthorized!')
			},
		})
	})

	it('should return 401 if user has insufficient permissions', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 40, role: 2, email: 'user@example.com' } // writer
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(401)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 200 with user data if permission is sufficient', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80, role: 1, email: 'user@example.com' }
		const mockUsers = [
			{
				id: 1,
				email: 'user1@example.com',
				role: 'admin',
				username: 'skibidi 1',
				deleted_at: null,
			},
			{
				id: 2,
				email: 'user2@example.com',
				role: 'writer',
				username: 'skibidi 2',
				deleted_at: null,
			},
		]
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getAllUsersWithRoles as jest.Mock).mockResolvedValue(mockUsers)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(200)
				expect(result.users).toEqual(mockUsers)
			},
		})
	})

	it('should return 500 on internal server error', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80, role: 1, email: 'user@example.com' }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getAllUsersWithRoles as jest.Mock).mockRejectedValue(
			new Error('Database error')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal Server Error')
			},
		})
	})
})
