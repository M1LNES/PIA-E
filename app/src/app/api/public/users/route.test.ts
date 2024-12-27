import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/queries'
import * as appHandler from './route'
import { AppHandlerType } from '../test-interface'
import { NextRequest } from 'next/server'

jest.mock('@/app/api/queries', () => ({
	__esModule: true,
	getRoleUserCounts: jest.fn(),
}))

describe('GET /api/public/users/by-role', () => {
	it('should return all roles and total count of assigned users when getRoleUserCounts succeeds', async () => {
		const mockResponse = {
			reader: 123,
			writer: 100,
			admin: 30,
			superadmin: 2,
		}
		;(queries.getRoleUserCounts as jest.Mock).mockResolvedValue(mockResponse)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(200)
				expect(result).toEqual(mockResponse)
			},
		})
	})
	it('should return 500 when getRoleUserCounts throws an error', async () => {
		;(queries.getRoleUserCounts as jest.Mock).mockRejectedValue(
			new Error('Failed to fetch total user count from the database')
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
