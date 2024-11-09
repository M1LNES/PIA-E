import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../../public/test-interface'

jest.mock('@/app/api/queries', () => ({
	__esModule: true,
	getAllCategories: jest.fn(),
	getUserByEmail: jest.fn(), // Updated to use getUserByEmail
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('GET /api/category/get-categories', () => {
	it('should return categories when user has sufficient permissions', async () => {
		// Mock session and user permissions
		const mockSession = {
			user: {
				email: 'user@example.com',
			},
		}

		const mockUser = {
			id: 1,
			username: 'user123',
			email: 'user@example.com',
			role: 1,
			type: 'admin',
			permission: 80,
		}

		const mockCategories = [
			{ id: 1, name: 'Category A' },
			{ id: 2, name: 'Skibidi Sigma' },
			{ id: 3, name: 'Gen Z rizzler' },
		]

		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getAllCategories as jest.Mock).mockResolvedValue(mockCategories)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(200)
				expect(result.categories).toEqual(mockCategories)
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

	it('should return 401 when user has insufficient permissions', async () => {
		// Mock session and user with insufficient permissions
		const mockSession = {
			user: {
				email: 'user@example.com',
			},
		}

		const mockUser = {
			id: 1,
			username: 'user123',
			email: 'user@example.com',
			role: 3,
			type: 'reader',
			permission: 20,
		}

		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(401)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 500 when an error occurs while fetching categories', async () => {
		// Mock session and user permissions
		const mockSession = {
			user: {
				email: 'user@example.com',
			},
		}
		const mockUser = {
			id: 1,
			username: 'user123',
			email: 'user@example.com',
			role: 1,
			type: 'admin',
			permission: 80,
		}

		// Simulate an error when fetching categories
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getAllCategories as jest.Mock).mockRejectedValue(
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
