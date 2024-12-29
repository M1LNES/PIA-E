import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route'
import { AppHandlerType } from '../../utils/test-interface'
import { NextRequest } from 'next/server'
import { TotalCommentsResponse } from '../../utils/dtos'
import { InputEmailAddress } from '@/dto/post-bodies'

jest.mock('@/app/api/utils/queries', () => ({
	__esModule: true,
	getCommentsByPost: jest.fn(),
	getTotalComments: jest.fn(),
}))

describe('POST /api/public/comments/user', () => {
	it('should return comments grouped by post ID when email is provided', async () => {
		const mockBody = { emailAddress: 'mailmail@seznam.cz' }
		const mockCommentsByPost: { post: number; comment_count: number }[] = [
			{ post: 1, comment_count: 3 },
			{ post: 2, comment_count: 5 },
			{ post: 89, comment_count: 65 },
			{ post: 343, comment_count: 54 },
		]

		;(queries.getCommentsByPost as jest.Mock).mockResolvedValue(
			mockCommentsByPost
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify(mockBody),
				})
				const result = await response.json()

				// Check the response status and result
				expect(response.status).toBe(200)
				expect(result).toEqual({
					post1: 3,
					post2: 5,
					post89: 65,
					post343: 54,
				})
			},
		})
	})

	it('should return 400 when email is missing in request body', async () => {
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

				// Check the response status and error message
				expect(response.status).toBe(400)
				expect(result).toEqual({ error: 'Email is required' })
			},
		})
	})

	it('should return 500 when getCommentsByPost throws an error', async () => {
		const mockEmail = 'test@example.com'
		const mockBody: InputEmailAddress = { emailAddress: mockEmail }

		;(queries.getCommentsByPost as jest.Mock).mockRejectedValue(
			new Error('Database error')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify(mockBody),
				})
				const result = await response.json()

				// Check the response status and error message
				expect(response.status).toBe(500)
				expect(result).toEqual({ error: 'Internal server error' })
			},
		})
	})
})

describe('GET /api/public/comments/all-users', () => {
	it('should return object with total comments count when getTotalComments succeeds', async () => {
		;(queries.getTotalComments as jest.Mock).mockResolvedValue(12648)
		const output: TotalCommentsResponse = { totalComments: 12648 }
		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(200)
				expect(result).toEqual(output)
			},
		})
	})
	it('should return 500 when getTotalComments throws an error', async () => {
		;(queries.getTotalComments as jest.Mock).mockRejectedValue(
			new Error('Failed to fetch coments from the database')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })

				// Check the response status is 500
				expect(response.status).toBe(500)
			},
		})
	})
})
