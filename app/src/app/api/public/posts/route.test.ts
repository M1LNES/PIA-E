import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route'
import { AppHandlerType } from '../../utils/test-interface'
import { NextRequest } from 'next/server'

jest.mock('@/app/api/utils/queries', () => ({
	__esModule: true,
	getCategoryPostCounts: jest.fn(),
}))

describe('GET /api/public/posts', () => {
	it('should return category post count when getCategoryPostCounts succeeds', async () => {
		const mockResponse: Record<string, number>[] = [
			{ ProjectA: 10 },
			{ ProjectB: 30 },
			{ SkibidiProject: 3 },
		]
		;(queries.getCategoryPostCounts as jest.Mock).mockResolvedValue(
			mockResponse
		)

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
	it('should return 500 when getCategoryPostCounts throws an error', async () => {
		;(queries.getCategoryPostCounts as jest.Mock).mockRejectedValue(
			new Error('Failed to fetch total category post count from the database')
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
