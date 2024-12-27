import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../../public/test-interface'

jest.mock('@/app/api/queries', () => ({
	__esModule: true,
	getUserByEmail: jest.fn(),
	getUserDetailsById: jest.fn(),
	getRolePermission: jest.fn(),
	updateUserRole: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('PATCH /api/users/role', () => {
	it('should return 401 if session is missing', async () => {
		;(getServerSession as jest.Mock).mockResolvedValue(null)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'PATCH' })
				const result = await response.json()

				expect(response.status).toBe(401)
				expect(result.error).toBe('Unauthorized!')
			},
		})
	})

	it('should return 400 if required values are invalid', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PATCH',
					body: JSON.stringify({ userId: null, roleId: null }), // Invalid values
				})
				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('Required values are invalid')
			},
		})
	})

	it('should return 400 if user or role is not found', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue({ permission: 80 })
		;(queries.getUserDetailsById as jest.Mock).mockResolvedValue(null) // User not found
		;(queries.getRolePermission as jest.Mock).mockResolvedValue(10)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PATCH',
					body: JSON.stringify({ userId: 1, roleId: 2 }), // User or role not found
				})
				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('User or role not found')
			},
		})
	})

	it('should return 403 if not enough permissions', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockDbUser = { permission: 80, role: 1, email: 'user@example.com' }
		const mockUpdatedUser = {
			id: 77,
			username: 'user123',
			email: 'user@example.com',
			role: 1,
			type: 'reader',
			permission: 80,
		}
		const mockRolePerm = 30 // Role permission lower than user
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockDbUser)
		;(queries.getUserDetailsById as jest.Mock).mockResolvedValue(
			mockUpdatedUser
		)
		;(queries.getRolePermission as jest.Mock).mockResolvedValue(mockRolePerm)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PATCH',
					body: JSON.stringify({ userId: 1, roleId: 2 }),
				})
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 200 and change role successfully', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockDbUser = { permission: 80, role: 1, email: 'user@example.com' }
		const mockUpdatedUser = {
			id: 3,
			username: 'user123',
			email: 'user@example.com',
			role: 3,
			type: 'reader',
			permission: 20,
		} // User to be updated has lower permission
		const mockRolePerm = 40 // Role permission lower than user
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockDbUser)
		;(queries.getUserDetailsById as jest.Mock).mockResolvedValue(
			mockUpdatedUser
		)
		;(queries.getRolePermission as jest.Mock).mockResolvedValue(mockRolePerm)
		;(queries.updateUserRole as jest.Mock).mockResolvedValue(null)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PATCH',
					body: JSON.stringify({ userId: 1, roleId: 2 }), // Successful role change
				})
				const result = await response.json()

				expect(response.status).toBe(200)
				expect(result.message).toBe('Role successfully changed!')
			},
		})
	})

	it('should return 500 on internal server error', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockDbUser = { permission: 80, role: 1, email: 'user@example.com' }
		const mockUpdatedUser = {
			id: 3,
			username: 'user123',
			email: 'user@example.com',
			role: 3,
			type: 'reader',
			permission: 20,
		}
		const mockRolePerm = 10
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockDbUser)
		;(queries.getUserDetailsById as jest.Mock).mockResolvedValue(
			mockUpdatedUser
		)
		;(queries.getRolePermission as jest.Mock).mockResolvedValue(mockRolePerm)
		;(queries.updateUserRole as jest.Mock).mockRejectedValue(
			new Error('Database error')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PATCH',
					body: JSON.stringify({ userId: 1, roleId: 2 }), // Trigger internal server error
				})
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal Server Error')
			},
		})
	})
})
