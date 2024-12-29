import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { getRoleUserCountsPublic } from '../../service/user-service'

/**
 * API Route: GET /api/public/users
 *
 * This route retrieves the count of users grouped by their roles.
 * It returns the data in JSON format or an error message if the operation fails.
 */
export const revalidate = 1 // Cache revalidation time in seconds
export const fetchCache = 'force-no-store' // Disables caching for this request

const route = 'GET /api/public/users'

/**
 * Handles the GET request to fetch the user counts by role.
 *
 * @returns {NextResponse} - A response containing the user count by role or an error message.
 */
export async function GET(): Promise<NextResponse> {
	// Log the start of the request to fetch users by role
	log('debug', route, 'Fetching users by role')

	try {
		// Fetch user counts grouped by their roles
		const roleUserCounts = await getRoleUserCountsPublic()

		// Log the successful retrieval of user role counts
		log(
			'info',
			route,
			'Roles for each user successfully fetched',
			roleUserCounts
		)

		// Return the user role counts as a JSON response with a 200 OK status
		return NextResponse.json(roleUserCounts, { status: 200 })
	} catch (error) {
		// Log any errors encountered during the request
		log('error', route, 'Failed to fetch user roles', {
			error: (error as Error).message,
		})

		// Return a 500 Internal Server Error response in case of failure
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
