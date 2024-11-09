import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../../public/test-interface'

jest.mock('@/app/api/queries', () => ({
	__esModule: true,
	getPostsWithDetails: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('GET /api/posts/get-all-posts', () => {
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
