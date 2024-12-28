import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../utils/test-interface'
import bcrypt from 'bcrypt'

jest.mock('@/app/api/utils/queries', () => ({
	__esModule: true,
	getUserByEmail: jest.fn(),
	getRolePermission: jest.fn(),
	isEmailUsed: jest.fn(),
	createUser: jest.fn(),
	getUserWithPermissions: jest.fn(),
	getAllUsersWithRoles: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

jest.mock('bcrypt', () => ({
	hash: jest.fn(),
}))

describe('POST /api/users', () => {
	it('should return 401 if session is missing', async () => {
		;(getServerSession as jest.Mock).mockResolvedValue(null)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						username: 'newuser',
						email: 'newuser@example.com',
						selectedRole: 2,
						password: 'password123',
						confirmPassword: 'password123',
					}),
				})

				const result = await response.json()

				expect(response.status).toBe(401)
				expect(result.error).toBe('Unauthorized!')
			},
		})
	})

	it('should return 400 if required fields are missing', async () => {
		const mockSession = { user: { email: 'admin@example.com' } }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({}), // Missing fields
				})

				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('All fields are required')
			},
		})
	})

	it('should return 409 if email is already used', async () => {
		const mockSession = { user: { email: 'admin@example.com' } }
		const mockUser = { permission: 100 }
		const mockRolePermission = 40
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getRolePermission as jest.Mock).mockResolvedValue(
			mockRolePermission
		)
		;(queries.isEmailUsed as jest.Mock).mockResolvedValue(true)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						username: 'newuser',
						email: 'newuser@example.com',
						selectedRole: 2,
						password: 'password123',
						confirmPassword: 'password123',
					}),
				})

				const result = await response.json()

				expect(response.status).toBe(409)
				expect(result.error).toBe('Email is already being used')
			},
		})
	})

	it('should return 403 if user does not have enough permissions', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 50 }
		const mockRolePermission = 60
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getRolePermission as jest.Mock).mockResolvedValue(
			mockRolePermission
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
						username: 'newuser',
						email: 'newuser@example.com',
						selectedRole: 2,
						password: 'password123',
						confirmPassword: 'password123',
					}),
				})

				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should create user successfully', async () => {
		const mockSession = { user: { email: 'admin@example.com' } }
		const mockUser = { permission: 100 }
		const mockRolePermission = 40
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getRolePermission as jest.Mock).mockResolvedValue(
			mockRolePermission
		)
		;(queries.isEmailUsed as jest.Mock).mockResolvedValue(false)
		;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123')

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						username: 'newuser',
						email: 'newuser@example.com',
						selectedRole: 2,
						password: 'password123',
						confirmPassword: 'password123',
					}),
				})

				const result = await response.json()

				expect(response.status).toBe(201)
				expect(result.message).toBe('User created successfully')
				expect(queries.createUser).toHaveBeenCalledWith(
					'newuser',
					2,
					'newuser@example.com',
					'hashedPassword123'
				)
			},
		})
	})

	it('should return 500 on internal server error', async () => {
		const mockSession = { user: { email: 'admin@example.com' } }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.isEmailUsed as jest.Mock).mockRejectedValue(
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
						username: 'newuser',
						email: 'newuser@example.com',
						selectedRole: 2,
						password: 'password123',
						confirmPassword: 'password123',
					}),
				})

				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal server error')
			},
		})
	})

	it('should return 400 if password and conffirm password are not same', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 50 }
		const mockRolePermission = 60
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getRolePermission as jest.Mock).mockResolvedValue(
			mockRolePermission
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
						username: 'newuser',
						email: 'newuser@example.com',
						selectedRole: 2,
						password: 'password123',
						confirmPassword: 'skibidi123',
					}),
				})

				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('Passwords are not same!')
			},
		})
	})

	it('should return 400 if email is not in valid format', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 50 }
		const mockRolePermission = 60
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getRolePermission as jest.Mock).mockResolvedValue(
			mockRolePermission
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
						username: 'newuser',
						email: '657fgybhinuiuhbdewiybewdiy',
						selectedRole: 2,
						password: 'password123',
						confirmPassword: 'password123',
					}),
				})

				const result = await response.json()

				expect(response.status).toBe(400)
				expect(result.error).toBe('Invalid e-mail address')
			},
		})
	})
})

describe('GET /api/users', () => {
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

	it('should return 403 if user has insufficient permissions', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 40, role: 2, email: 'user@example.com' } // writer
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(403)
				expect(result.error).toBe('Not enough permissions!')
			},
		})
	})

	it('should return 200 with user data if permission is sufficient', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80, role: 1, email: 'user@example.com' }
		const mockUsers = [
			{
				id: 1,
				email: 'user1@example.com',
				role: 'admin',
				username: 'skibidi 1',
				deleted_at: null,
			},
			{
				id: 2,
				email: 'user2@example.com',
				role: 'writer',
				username: 'skibidi 2',
				deleted_at: null,
			},
		]
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getAllUsersWithRoles as jest.Mock).mockResolvedValue(mockUsers)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(200)
				expect(result.users).toEqual(mockUsers)
			},
		})
	})

	it('should return 500 on internal server error', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const mockUser = { permission: 80, role: 1, email: 'user@example.com' }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getUserWithPermissions as jest.Mock).mockResolvedValue(mockUser)
		;(queries.getAllUsersWithRoles as jest.Mock).mockRejectedValue(
			new Error('Database error')
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal Server Error')
			},
		})
	})
})