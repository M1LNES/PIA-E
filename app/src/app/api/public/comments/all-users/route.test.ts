import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/queries'
import * as appHandler from './route'
import { AppHandlerType } from '../../test-interface'
import { NextRequest } from 'next/server'

jest.mock('@/app/api/queries', () => ({
	__esModule: true,
	getTotalComments: jest.fn(),
}))

describe('GET /api/public/comments/all-users', () => {
	it('should return object with total comments count when getTotalComments succeeds', async () => {
		;(queries.getTotalComments as jest.Mock).mockResolvedValue(12648)

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(200)
				expect(result).toEqual({ totalComments: 12648 })
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
