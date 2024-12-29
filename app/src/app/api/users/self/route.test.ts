import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../../utils/test-interface'
import { UserSelfInfo } from '../../utils/dtos'
import { UserSelfInfoDomain } from '@/dto/types'
import { InputEmailAddress } from '@/dto/post-bodies'

jest.mock('@/app/api/utils/queries', () => ({
	__esModule: true,
	getUserByEmail: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('POST /api/users/self', () => {
	it('should return 401 if session is missing', async () => {
		;(getServerSession as jest.Mock).mockResolvedValue(null)
		const mockBody: InputEmailAddress = { emailAddress: 'skibidi@seznam.cz' }

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
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
		const mockSession = { user: { email: 'user@example.com' } }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({}), // Missing email
				})
				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('Email not specified!')
			},
		})
	})

	it('should return 403 if email does not match session user email', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockEmail = 'anotheruser@example.com'
		const mockBody: InputEmailAddress = { emailAddress: mockEmail }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(mockBody), // Email mismatch
				})
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions')
			},
		})
	})

	it('should return 403 if user was not found', async () => {
		const mockSession = { user: { email: 'user@example.com' } }

		const mockBody: InputEmailAddress = { emailAddress: mockSession.user.email }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(undefined)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(mockBody), // Email mismatch
				})
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 200 with user data if email matches session', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser: UserSelfInfo = {
			email: 'user@example.com',
			username: 'Test User',
			id: 1,
			permission: 80,
			type: 'admin',
			role: 1,
		}

		const outputUser: UserSelfInfoDomain = {
			userEmail: 'user@example.com',
			username: 'Test User',
			userId: 1,
			rolePermission: 80,
			roleType: 'admin',
			roleId: 1,
		}
		const mockBody: InputEmailAddress = { emailAddress: mockSession.user.email }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(mockBody),
				})
				const result = await response.json()

				expect(response.status).toBe(200)
				expect(result.user).toEqual(outputUser)
			},
		})
	})

	it('should return 500 on internal server error', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockBody: InputEmailAddress = { emailAddress: mockSession.user.email }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockRejectedValue(
			new Error('Database error')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(mockBody),
				})
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal Server Error')
			},
		})
	})
})
