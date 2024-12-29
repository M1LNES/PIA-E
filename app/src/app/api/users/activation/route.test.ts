import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../../utils/test-interface'
import { InputEmailAddress } from '@/dto/post-bodies'
import { UserDeleted, UserSelfInfo } from '../../utils/dtos'

jest.mock('@/app/api/utils/queries', () => ({
	__esModule: true,
	getUserByEmail: jest.fn(),
	getDeletedUserByEmail: jest.fn(),
	activateUserByEmail: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('PUT /api/users/activation', () => {
	it('should return 401 if session is missing', async () => {
		;(getServerSession as jest.Mock).mockResolvedValue(null)
		const mockBody: InputEmailAddress = { emailAddress: 'inactive@domain.com' }
		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(mockBody),
				})
				const result = await response.json()

				expect(response.status).toBe(401)
				expect(result.error).toBe('Unauthorized!')
			},
		})
	})

	it('should return 400 if email is missing in the request body', async () => {
		const mockSession = { user: { email: 'user@domain.com' } }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({}), // Missing email
				})
				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('Email not specified!')
			},
		})
	})

	it('should return 403 if user does not have enough permissions', async () => {
		const mockSession = { user: { email: 'user@domain.com' } }
		const mockUser: UserSelfInfo = {
			email: 'user@domain.com',
			permission: 50,
			id: 10,
			role: 5,
			type: 'nevim',
			username: 'KAREL',
		}
		const mockDeletedUser: UserDeleted = {
			email: 'inactive@domain.com',
			permission: 80,
			id: 4,
			role: 7,
			type: 'gsges',
			username: ' vilem',
		}
		const mockBody: InputEmailAddress = { emailAddress: 'inactive@domain.com' }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
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
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(mockBody),
				})
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 200 and activate user if permissions are sufficient', async () => {
		const mockSession = { user: { email: 'admin@domain.com' } }
		const mockUser: UserSelfInfo = {
			email: 'admin@domain.com',
			permission: 100,
			id: 5,
			role: 4,
			type: 'nejaka',
			username: 'pepa',
		}
		const mockDeletedUser: UserDeleted = {
			email: 'inactive@domain.com',
			permission: 50,
			id: 100,
			role: 43,
			type: 'roleaaa',
			username: 'karel 1',
		}
		const mockBody: InputEmailAddress = { emailAddress: 'active@domain.com' }

		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getDeletedUserByEmail as jest.Mock).mockResolvedValue(
			mockDeletedUser
		)
		;(queries.activateUserByEmail as jest.Mock).mockResolvedValue(true)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(mockBody),
				})
				const result = await response.json()

				expect(response.status).toBe(200)
				expect(result.message).toBe('User activated')
			},
		})
	})

	it('should return 500 on internal server error', async () => {
		const mockSession = { user: { email: 'admin@domain.com' } }
		const mockUser: UserSelfInfo = {
			email: 'admin@domain.com',
			permission: 100,
			id: 4,
			role: 5,
			type: 'role2',
			username: 'Vojta',
		}
		const mockBody: InputEmailAddress = { emailAddress: 'inactive@domain.com' }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getDeletedUserByEmail as jest.Mock).mockRejectedValue(
			new Error('Database error')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(mockBody),
				})
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal server error')
			},
		})
	})
})
