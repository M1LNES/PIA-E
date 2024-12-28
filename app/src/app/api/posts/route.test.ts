import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../public/test-interface'

jest.mock('@/app/api/utils/queries', () => ({
	__esModule: true,
	getUserIdByEmail: jest.fn(),
	getUserDetailsById: jest.fn(),
	insertPost: jest.fn(),
	getPostsWithDetails: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('POST /api/posts', () => {
	it('should return 401 if session is missing', async () => {
		;(getServerSession as jest.Mock).mockResolvedValue(null)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'POST' })
				const result = await response.json()

				expect(response.status).toBe(401)
				expect(result.error).toBe('Unauthorized!')
			},
		})
	})

	it('should return 403 if user is not found in the database', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserIdByEmail as jest.Mock).mockResolvedValue(null)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'POST' })
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 403 if user has insufficient permissions', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 10 } // insufficient permissions
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserIdByEmail as jest.Mock).mockResolvedValue(1)
		;(queries.getUserDetailsById as jest.Mock).mockResolvedValue(mockUser)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'POST' })
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 400 if required fields are missing in the request body', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80 } // sufficient permissions
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserIdByEmail as jest.Mock).mockResolvedValue(1)
		;(queries.getUserDetailsById as jest.Mock).mockResolvedValue(mockUser)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ title: '', description: '', category: -1 }),
				})
				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('All fields are required')
			},
		})
	})

	it('should return 201 when post is created successfully', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80 }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserIdByEmail as jest.Mock).mockResolvedValue(1)
		;(queries.getUserDetailsById as jest.Mock).mockResolvedValue(mockUser)
		;(queries.insertPost as jest.Mock).mockResolvedValue(true)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						title: 'Sample Title',
						description: 'Sample Description',
						category: 1,
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(201)
				expect(result.message).toBe('Post created successfully')
			},
		})
	})

	it('should return 500 on internal server error', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80 }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserIdByEmail as jest.Mock).mockResolvedValue(1)
		;(queries.getUserDetailsById as jest.Mock).mockResolvedValue(mockUser)
		;(queries.insertPost as jest.Mock).mockRejectedValue(
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
					body: JSON.stringify({
						title: 'Sample Title',
						description: 'Sample Description',
						category: 1,
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal server error')
			},
		})
	})
})

describe('GET /api/posts', () => {
	it('should return posts with status 200 if session exists', async () => {
		// Mock session and sample posts
		const mockSession = {
			user: {
				email: 'user@example.com',
			},
		}

		const mockPosts = [
			{ id: 1, title: 'Post 1', content: 'Content of post 1' },
			{ id: 2, title: 'Post 2', content: 'Content of post 2' },
		]

		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getPostsWithDetails as jest.Mock).mockResolvedValue(mockPosts)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(200)
				expect(result.posts).toEqual(mockPosts)
			},
		})
	})

	it('should return 401 Unauthorized if session is missing', async () => {
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

	it('should return 500 Internal Server Error if getPostsWithDetails throws an error', async () => {
		// Mock session and error from getPostsWithDetails
		const mockSession = {
			user: {
				email: 'user@example.com',
			},
		}

		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getPostsWithDetails as jest.Mock).mockRejectedValue(
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
