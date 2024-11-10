import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/queries'
import { NextRequest } from 'next/server'
import * as bcrypt from 'bcrypt'
import { getServerSession } from 'next-auth'
import { AppHandlerType } from '../../public/test-interface'
import * as appHandler from './route'

jest.mock('@/app/api/queries', () => ({
	__esModule: true,
	getHashedPasswordByEmail: jest.fn(),
	updateUserPassword: jest.fn(),
}))

jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('POST /api/users/change-password', () => {
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

	it('should return 401 if email does not match session user email', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({
						email: 'otheruser@example.com',
						oldPassword: 'oldpassword',
						newPassword: 'newpassword',
						newPasswordConfirm: 'newpassword',
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(401)
				expect(result.error).toBe('Unauthorized to change password!!!')
			},
		})
	})

	it('should return 404 if user is not found', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getHashedPasswordByEmail as jest.Mock).mockResolvedValue(null) // User not found

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({
						email: 'user@example.com',
						oldPassword: 'oldpassword',
						newPassword: 'newpassword',
						newPasswordConfirm: 'newpassword',
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(404)
				expect(result.error).toBe('User not found!')
			},
		})
	})

	it('should return 422 if old password is incorrect', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const hashedPassword = await bcrypt.hash('correctOldPassword', 10)
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getHashedPasswordByEmail as jest.Mock).mockResolvedValue(
			hashedPassword
		) // Hashed password from DB

		const oldPassword = 'incorrectOldPassword'

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({
						email: 'user@example.com',
						oldPassword: oldPassword,
						newPassword: 'newpassword',
						newPasswordConfirm: 'newpassword',
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(422)
				expect(result.error).toBe('You provided the wrong old password!')
			},
		})
	})

	it('should return 422 if new password and confirm password do not match', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const hashedPassword = await bcrypt.hash('correctOldPassword', 10)
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getHashedPasswordByEmail as jest.Mock).mockResolvedValue(
			hashedPassword
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({
						email: 'user@example.com',
						oldPassword: 'correctOldPassword',
						newPassword: 'newpassword',
						newPasswordConfirm: 'mismatchedPassword',
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(422)
				expect(result.error).toBe(
					'New password and confirm password are not the same!'
				)
			},
		})
	})

	it('should return 422 if new password is the same as old password', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const hashedPassword = await bcrypt.hash('oldpassword', 10)
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getHashedPasswordByEmail as jest.Mock).mockResolvedValue(
			hashedPassword
		)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({
						email: 'user@example.com',
						oldPassword: 'oldpassword',
						newPassword: 'oldpassword',
						newPasswordConfirm: 'oldpassword',
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(422)
				expect(result.error).toBe(
					'New password is the same as the old password!'
				)
			},
		})
	})

	it('should return 200 and change password successfully', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const hashedPassword = await bcrypt.hash('oldpassword', 10)
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getHashedPasswordByEmail as jest.Mock).mockResolvedValue(
			hashedPassword
		)
		;(queries.updateUserPassword as jest.Mock).mockResolvedValue(null) // Successful update

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({
						email: 'user@example.com',
						oldPassword: 'oldpassword',
						newPassword: 'newpassword',
						newPasswordConfirm: 'newpassword',
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(200)
				expect(result.message).toBe('Password successfully changed!')
			},
		})
	})

	it('should return 500 on internal server error', async () => {
		const mockSession = { user: { email: 'user@example.com' } }
		const hashedPassword = await bcrypt.hash('oldpassword', 10)
		;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
		;(queries.getHashedPasswordByEmail as jest.Mock).mockResolvedValue(
			hashedPassword
		)
		;(queries.updateUserPassword as jest.Mock).mockRejectedValue(
			new Error('Database error')
		) // Trigger error

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({
					method: 'POST',
					body: JSON.stringify({
						email: 'user@example.com',
						oldPassword: 'oldpassword',
						newPassword: 'newpassword',
						newPasswordConfirm: 'newpassword',
					}),
				})
				const result = await response.json()

				expect(response.status).toBe(500)
				expect(result.error).toBe('Internal Server Error')
			},
		})
	})
})
