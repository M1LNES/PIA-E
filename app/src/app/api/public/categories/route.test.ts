import { testApiHandler } from 'next-test-api-route-handler'
import * as queries from '@/app/api/utils/queries'
import * as appHandler from './route'
import { AppHandlerType } from '../../utils/test-interface'
import { NextRequest } from 'next/server'

jest.mock('@/app/api/utils/queries', () => ({
	__esModule: true,
	getAllCategories: jest.fn(),
}))

describe('GET /api/public/categories', () => {
	it('should return categories when getAllCategories succeeds', async () => {
		;(queries.getAllCategories as jest.Mock).mockResolvedValue([
			{ id: 1, name: 'GYAT category' },
			{ id: 2, name: 'Rizz category' },
			{ id: 3, name: 'Ohio category' },
		])

		const expectedOutput = [
			{ categoryId: 1, categoryName: 'GYAT category' },
			{ categoryId: 2, categoryName: 'Rizz category' },
			{ categoryId: 3, categoryName: 'Ohio category' },
		]

		await testApiHandler({
			appHandler: appHandler as unknown as {
				[key: string]: (req: NextRequest) => AppHandlerType
			},
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				// Check the response
				expect(response.status).toBe(200)
				expect(result).toEqual(expectedOutput)
			},
		})
	})
	it('should return 500 when getAllCategories throws an error', async () => {
		;(queries.getAllCategories as jest.Mock).mockRejectedValue(
			new Error('Failed to fetch categories from the database')
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
