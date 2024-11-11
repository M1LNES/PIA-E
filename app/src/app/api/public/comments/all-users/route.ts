import { NextResponse } from 'next/server'
import { getTotalComments } from '@/app/api/queries' // Adjust the import path as necessary
import { log } from '@/app/api/logger'

// Cache control settings
export const revalidate = 1
export const fetchCache = 'force-no-store'

// Define the route for logging purposes
const route = 'GET /api/public/comments/all-users'

/**
 * GET /api/public/comments/all-users
 * Fetches the total number of comments and returns it in the response.
 *
 * @returns {Response} - JSON response containing the total comments count.
 */
export async function GET() {
	log('debug', route, 'Fetching total comments...')
	try {
		// Fetch the total number of comments from the database
		const totalComments = await getTotalComments()

		// Log the successful fetch operation
		log('info', route, 'Total comments successfully fetched', { totalComments })

		// Return the total number of comments in JSON format with a 200 OK status
		return NextResponse.json({ totalComments }, { status: 200 })
	} catch (error) {
		// Log any errors that occur during the fetch operation
		log('error', route, 'Failed to fetch total comments', {
			error: (error as Error).message,
		})

		// Return a 500 Internal Server Error response
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
