import { testApiHandler } from 'next-test-api-route-handler'
import {
	getCommentsByPostId,
	getUserWithPermissions,
} from '@/app/api/utils/queries'
import * as appHandler from './route'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import { AppHandlerType } from '@/app/api/utils/test-interface'
import { Comment } from '../../utils/dtos'
import { CommentDomain } from '@/dto/types'

jest.mock('@/app/api/utils/queries', () => ({
	__esModule: true,
	getCommentsByPostId: jest.fn(),
	getUserWithPermissions: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('GET /api/comments/:postId', () => {
	it('should return 401 when session is missing', async () => {
		;(getServerSession as jest.Mock).mockResolvedValue(null)

		const mockParams = { postId: '123' }

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			params: mockParams,
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(401)
				expect(result.error).toBe('Unauthorized!')
			},
		})
	})

	it('should return 400 when postId is not specified', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			params: { postId: '' },
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('Post Id not specified')
			},
		})
	})

	it('should return 401 when user has insufficient permissions', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = {
			email: 'user@example.com',
			permission: 1,
		}
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			params: { postId: '123' },
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return comments when user has sufficient permissions and postId is valid', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = {
			email: 'user@example.com',
			permission: 80,
		}
		const mockComments: Comment[] = [
			{
				id: 1,
				post: 123,
				description: 'First comment',
				created_at: '2024-01-01T00:00:00.000Z',
				username: 'user1',
			},
			{
				id: 2,
				post: 123,
				description: 'Second comment',
				created_at: '2024-01-02T00:00:00.000Z',
				username: 'user2',
			},
		]

		const outputComments: CommentDomain[] = [
			{
				commentId: 1,
				postId: 123,
				content: 'First comment',
				createdAt: '2024-01-01T00:00:00.000Z',
				username: 'user1',
			},
			{
				commentId: 2,
				postId: 123,
				content: 'Second comment',
				createdAt: '2024-01-02T00:00:00.000Z',
				username: 'user2',
			},
		]

		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(getCommentsByPostId as jest.Mock).mockResolvedValue(mockComments)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			params: { postId: '123' },
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(200)
				expect(result).toEqual(outputComments)
			},
		})
	})

	it('should return 500 when an error occurs while fetching comments', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = {
			email: 'user@example.com',
			permission: 80,
		}
		const mockParams = { postId: '123' }

		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(getCommentsByPostId as jest.Mock).mockRejectedValue(
			new Error('Database error')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			params: mockParams,
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal Server Error')
			},
		})
	})
})
