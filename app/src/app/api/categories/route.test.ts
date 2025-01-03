import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route' // Assuming the handler is in the same directory
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType, Category } from '../utils/test-interface'
import { CategoryDomain } from '@/dto/types'
import { DbCategory, UserSelfInfo } from '../utils/dtos'
import { CreateCategoryRequest } from '@/dto/post-bodies'

jest.mock('@/app/api/utils/queries', () => ({
	__esModule: true,
	getUserByEmail: jest.fn(),
	checkDuplicateCategory: jest.fn(),
	createCategory: jest.fn(),
	getAllCategories: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('POST /api/categories', () => {
	it('should return 401 if the user is not authenticated', async () => {
		;(getServerSession as jest.Mock).mockResolvedValue(null) // Mocking an unauthenticated user

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({ categoryTitle: 'New Category' }),
				})
				const result = await response.json()

				expect(response.status).toBe(401)
				expect(result.error).toBe('Unauthorized!')
			},
		})
	})

	it('should return 400 if the title field is missing', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const reqBody: CreateCategoryRequest = { categoryTitle: '' }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify(reqBody),
				})
				const result = await response.json()

				expect(result.error).toBe('Title field required')
				expect(response.status).toBe(400)
			},
		})
	})

	it('should return 403 if the user has insufficient permissions', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser: UserSelfInfo = {
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
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({ categoryTitle: 'New Category' }),
				})
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 409 if the category title already exists', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser: UserSelfInfo = {
			id: 1,
			username: 'user123',
			email: 'user@example.com',
			role: 1,
			type: 'admin',
			permission: 80,
		}
		const existingCategory: DbCategory[] = [{ id: 1, name: 'New Category' }]
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.checkDuplicateCategory as jest.Mock).mockResolvedValue(
			existingCategory
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({ categoryTitle: 'New Category' }),
				})
				const result = await response.json()

				expect(response.status).toBe(409)
				expect(result.error).toBe('Category with this title already exists!')
			},
		})
	})

	it('should successfully create a new category', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser: UserSelfInfo = {
			id: 1,
			username: 'user123',
			email: 'user@example.com',
			role: 1,
			type: 'admin',
			permission: 80,
		}
		const newCategory: DbCategory = { id: 1, name: 'New Category' }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.checkDuplicateCategory as jest.Mock).mockResolvedValue([])
		;(queries.createCategory as jest.Mock).mockResolvedValue(newCategory)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({ categoryTitle: 'New Category' }),
				})
				const result = await response.json()

				expect(response.status).toBe(201)
				expect(result.message).toEqual('Category created')
			},
		})
	})

	it('should return 500 if there is an internal server error', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser: UserSelfInfo = {
			id: 1,
			username: 'user123',
			email: 'user@example.com',
			role: 1,
			type: 'admin',
			permission: 80,
		}
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.checkDuplicateCategory as jest.Mock).mockResolvedValue([])
		;(queries.createCategory as jest.Mock).mockRejectedValue(
			new Error('Database error')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({ categoryTitle: 'New Category' }),
				})
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal Server Error')
			},
		})
	})

	it('Should return 403 when user is disabled', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const newCategory: DbCategory = { id: 1, name: 'New Category' }

		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(undefined) // user is disabled - no permissions!
		;(queries.checkDuplicateCategory as jest.Mock).mockResolvedValue([])
		;(queries.createCategory as jest.Mock).mockResolvedValue(newCategory)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({ categoryTitle: 'New Category' }),
				})
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})
})

describe('GET /api/categories', () => {
	it('should return categories when user has sufficient permissions', async () => {
		// Mock session and user permissions
		const mockSession = {
			user: {
				email: 'user@example.com',
			},
		}

		const mockUser: UserSelfInfo = {
			id: 1,
			username: 'user123',
			email: 'user@example.com',
			role: 1,
			type: 'admin',
			permission: 80,
		}

		const mockCategories: Category[] = [
			{ id: 1, name: 'Category A' },
			{ id: 2, name: 'Skibidi Sigma' },
			{ id: 3, name: 'Gen Z rizzler' },
		]

		const mockCategoriesMapped: CategoryDomain[] = [
			{
				categoryId: 1,
				categoryName: 'Category A',
			},
			{
				categoryId: 2,
				categoryName: 'Skibidi Sigma',
			},
			{
				categoryId: 3,
				categoryName: 'Gen Z rizzler',
			},
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
				expect(result.categories).toEqual(mockCategoriesMapped)
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

	it('should return 403 when user has insufficient permissions', async () => {
		// Mock session and user with insufficient permissions
		const mockSession = {
			user: {
				email: 'user@example.com',
			},
		}

		const mockUser: UserSelfInfo = {
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
				expect(response.status).toBe(403)
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
		const mockUser: UserSelfInfo = {
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
