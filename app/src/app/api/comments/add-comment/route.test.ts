import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../../public/test-interface'

jest.mock('@/app/api/queries', () => ({
	__esModule: true,
	getUserIdByEmail: jest.fn(),
	getUserDetailsById: jest.fn(),
	insertComment: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('POST /api/comments/add-comment', () => {
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

	it('should return 422 if user is not found in the database', async () => {
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

				expect(response.status).toBe(422)
				expect(result.error).toBe('User not found in DB!')
			},
		})
	})

	it('should return 401 if user has insufficient permissions', async () => {
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

				expect(response.status).toBe(401)
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
					body: JSON.stringify({ description: '', postId: '' }),
				})
				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('Missing required fields')
			},
		})
	})

	it('should return 200 when comment is created successfully', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80 }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserIdByEmail as jest.Mock).mockResolvedValue(1)
		;(queries.getUserDetailsById as jest.Mock).mockResolvedValue(mockUser)
		;(queries.insertComment as jest.Mock).mockResolvedValue({
			comment_id: 1,
			post_id: 1,
			user_id: 1,
			description: 'Sample Comment',
			created_at: null,
		})

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						description: 'Sample Comment',
						postId: 1,
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(200)
				expect(result.message).toBe('Comment created')
				expect(result.comment.description).toBe('Sample Comment')
			},
		})
	})

	it('should return 500 on internal server error', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80 }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserIdByEmail as jest.Mock).mockResolvedValue(1)
		;(queries.getUserDetailsById as jest.Mock).mockResolvedValue(mockUser)
		;(queries.insertComment as jest.Mock).mockRejectedValue(
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
						description: 'Sample Comment',
						postId: 1,
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal server error')
			},
		})
	})
})
