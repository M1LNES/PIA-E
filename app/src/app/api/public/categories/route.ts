import { NextResponse } from 'next/server'
import { getAllCategories } from '@/app/api/queries'
import { log } from '@/app/api/logger'

// Cache control settings
export const revalidate = 1
export const fetchCache = 'force-no-store'

// Define the route path for logging
const route = 'GET /api/public/categories'

/**
 * GET /api/public/categories
 * Fetches all categories and returns them as JSON.
 *
 * @returns {Response} - JSON response containing the categories.
 */
export async function GET() {
	log('debug', route, 'Fetching all categories...')
	try {
		// Fetch all categories from the database
		const result = await getAllCategories()

		// Log the successful fetch operation
		log('info', route, 'All categories successfully fetched', { result })

		// Return the categories in JSON format with a 200 OK status
		return NextResponse.json(result, { status: 200 })
	} catch (error) {
		// Log any errors encountered during the fetch operation
		log('error', route, 'Failed to fetch categories', {
			error: (error as Error).message,
		})

		// Return a 500 Internal Server Error response
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
