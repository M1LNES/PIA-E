import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../../public/test-interface'

jest.mock('@/app/api/queries', () => ({
	__esModule: true,
	getUserWithPermissions: jest.fn(),
	getDeletedUserByEmail: jest.fn(),
	disableUserByEmail: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('PUT /api/users/deactivation', () => {
	it('should return 401 if session is missing', async () => {
		;(getServerSession as jest.Mock).mockResolvedValue(null)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PUT',
					body: JSON.stringify({ email: 'anotheruser@example.com' }),
				})
				const result = await response.json()

				expect(response.status).toBe(401)
				expect(result.error).toBe('Unauthorized!')
			},
		})
	})

	it('should return 403 if user has insufficient permissions', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80, role: 1, email: 'user@example.com' }
		const mockDeletedUser = {
			permission: 80,
			role: 1,
			email: 'user2@example.com',
		} // permission higher than current user
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getDeletedUserByEmail as jest.Mock).mockResolvedValue(
			mockDeletedUser
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PUT',
					body: JSON.stringify({ email: 'anotheruser@example.com' }),
				})
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 400 if email is not specified', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80, role: 1, email: 'user@example.com' }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PUT',
					body: JSON.stringify({}), // No email provided
				})
				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('Email not specified!')
			},
		})
	})

	it('should return 200 and disable user successfully', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = {
			permission: 100,
			role: 4,
			email: 'super-admin-borec@example.com',
		}
		const mockDeletedUser = null // No deleted user
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getDeletedUserByEmail as jest.Mock).mockResolvedValue(
			mockDeletedUser
		)
		;(queries.disableUserByEmail as jest.Mock).mockResolvedValue(null)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PUT',
					body: JSON.stringify({ email: 'userToDisable@example.com' }),
				})
				const result = await response.json()

				expect(response.status).toBe(200)
				expect(result.message).toBe('User disabled')
			},
		})
	})

	it('should return 500 on internal server error', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80 } // sufficient permissions
		const mockDeletedUser = null // No deleted user
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getDeletedUserByEmail as jest.Mock).mockResolvedValue(
			mockDeletedUser
		)
		;(queries.disableUserByEmail as jest.Mock).mockRejectedValue(
			new Error('Database error')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PUT',
					body: JSON.stringify({ email: 'userToDisable@example.com' }),
				})
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal Server Error')
			},
		})
	})
})
