import { testApiHandler } from 'next-test-api-route-handler'
import * as Ably from 'ably'
import { getServerSession } from 'next-auth'
import * as appHandler from './route'
import { AppHandlerType } from '../utils/test-interface'
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

jest.mock('ably', () => ({
	Rest: jest.fn().mockImplementation(() => ({
		auth: {
			createTokenRequest: jest.fn().mockResolvedValue({ token: 'dummy_token' }),
		},
	})),
}))

describe('GET /api/live', () => {
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

	it('should return token request data when session exists', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockTokenRequest = { token: 'dummy_token' }

		// Mock getServerSession to return a valid session
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

		// Mock the behavior of Ably.Rest class and its auth.createTokenRequest method
		const mockCreateTokenRequest = jest.fn().mockResolvedValue(mockTokenRequest)

		// Mock Ably.Rest constructor to return an object with auth.createTokenRequest
		const mockAblyRest = {
			auth: { createTokenRequest: mockCreateTokenRequest },
		}
		;(Ably.Rest as unknown as jest.Mock).mockImplementation(() => mockAblyRest)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })

				const textResponse = await response.text() // Get raw response text

				const result = JSON.parse(textResponse)
				expect(response.status).toBe(200)
				expect(result).toEqual(mockTokenRequest)
			},
		})
	})
})
