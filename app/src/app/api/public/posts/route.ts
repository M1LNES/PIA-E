import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { getCategoryPostCountsPublic } from '../../service/post-service'
import { ErrorResponse } from '@/dto/types'

/**
 * API Route: GET /api/public/posts
 *
 * This route retrieves the number of posts grouped by category.
 * It returns the data in JSON format or an error message if the operation fails.
 */
export const revalidate = 1 // Cache revalidation time in seconds
export const fetchCache = 'force-no-store' // Disables caching for this request

const route = 'GET /api/public/posts'

/**
 * Handles the GET request to fetch the post counts by category.
 *
 * @returns {Promise<NextResponse<ErrorResponse | Record<string, number>>>} - A response containing the post count by category or an error message.
 */
export async function GET(): Promise<
	NextResponse<ErrorResponse | Record<string, number>>
> {
	try {
		// Fetch post counts grouped by category
		const categoryPostCounts = await getCategoryPostCountsPublic()

		// Log the successful retrieval of category post counts
		log('info', route, 'Category posts count fetched.', categoryPostCounts)

		// Return the post counts as a JSON response with a 200 OK status
		return NextResponse.json(categoryPostCounts, { status: 200 })
	} catch (error) {
		// Log any errors encountered during the request
		log('error', route, 'Failed to fetch categories', {
			error: (error as Error).message,
		})

		// Return a 500 Internal Server Error response in case of failure
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
