import { testApiHandler } from 'next-test-api-route-handler'
import * as appHandler from './route'
import { Author } from '../../utils/test-interface'

describe('GET /api/public/authors', () => {
	it('Authors endpoint returns array with authors', async () => {
		await testApiHandler({
			appHandler,
			test: async ({ fetch }) => {
				const response = await fetch({ method: 'GET' })
				const result = await response.json()

				expect(Array.isArray(result)).toBe(true)
				expect(
					result.some((author: Author) => author.name === 'Milan Janoch')
				).toBe(true)
				await expect(result.length).toBe(2)
			},
		})
	})
})
