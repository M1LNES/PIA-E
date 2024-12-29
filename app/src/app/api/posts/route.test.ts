import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../utils/test-interface'
import { DbPostWithDetails } from '../utils/dtos'
import { PostWithDetailsDomain } from '@/dto/types'

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
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({}),
				})
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
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({}),
				})
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
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({}),
				})
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
					body: JSON.stringify({
						postTitle: '',
						postDescription: '',
						postCategory: -1,
					}),
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
						postTitle: 'Sample Title',
						postDescription: 'Sample Description',
						postCategory: 1,
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
						postTitle: 'Sample Title',
						postDescription: 'Sample Description',
						postCategory: 1,
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

		const mockPosts: DbPostWithDetails[] = [
			{
				username: 'franta',
				role_type: 'admin',
				post_id: 12,
				title: 'Cenda nevim',
				description: 'Zdarec parek',
				created_at: '2024-01-01T00:00:00.000Z',
				edited_at: null,
				category_name: 'omni cast',
				comment_count: 10,
			},
			{
				username: 'franta',
				role_type: 'admin',
				post_id: 16,
				title: 'Cenda nevim 1234',
				description: 'Zdarec parek fesmlefksef',
				created_at: '2024-01-02T00:00:00.000Z',
				edited_at: null,
				category_name: 'omni skibidi',
				comment_count: 123,
			},
		]

		const expectedPosts: PostWithDetailsDomain[] = [
			{
				username: 'franta',
				roleType: 'admin',
				postId: 12,
				title: 'Cenda nevim',
				description: 'Zdarec parek',
				createdAt: '2024-01-01T00:00:00.000Z',
				editedAt: null,
				categoryName: 'omni cast',
				commentCount: 10,
			},
			{
				username: 'franta',
				roleType: 'admin',
				postId: 16,
				title: 'Cenda nevim 1234',
				description: 'Zdarec parek fesmlefksef',
				createdAt: '2024-01-02T00:00:00.000Z',
				editedAt: null,
				categoryName: 'omni skibidi',
				commentCount: 123,
			},
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
				expect(result.posts).toEqual(expectedPosts)
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
