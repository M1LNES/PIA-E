import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getAllRoles, getUserWithPermissions } from '@/app/api/queries'
import { log } from '@/app/api/logger'

/**
 * API Route: GET /api/roles
 *
 * This route retrieves all available roles if the user is authenticated and authorized.
 * The route first checks if the user is authenticated, and then checks if they have the required permissions
 * to access the roles. If successful, it returns a list of roles; otherwise, it returns an error.
 */
export const revalidate = 1 // Cache revalidation time in seconds
export const fetchCache = 'force-no-store' // Disables caching for this request

const route = 'GET /api/roles'

/**
 * Handles the GET request to fetch available roles for a user.
 *
 * @returns {NextResponse} - A response containing roles data or an error message.
 */
export async function GET() {
	/* Authentication */
	// Retrieve the session information to check if the user is authenticated
	const session = await getServerSession()
	if (!session) {
		// Log and return a 401 Unauthorized response if no session is found
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */
	try {
		// Log the attempt to fetch roles and verify the user's permissions
		log(
			'debug',
			route,
			`Checking user permission ${session.user?.email} and fetching roles...`
		)

		// Fetch the user with their permissions based on their email
		const user = await getUserWithPermissions(session.user?.email as string)

		// Check if the user has the required permissions to access the roles
		if (user.permission < config.pages.manageUsers.minPermission) {
			// Log and return a 401 response if the user doesn't have enough permissions
			log(
				'warn',
				route,
				`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`,
				user
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 401 }
			)
		}

		// Fetch all available roles from the database
		const roles = await getAllRoles()

		// Log the successful retrieval of roles and return them in the response
		log('info', route, `Returning roles for user ${session.user?.email}`, {
			roles,
		})
		return NextResponse.json({ roles }, { status: 200 })
	} catch (error) {
		// Log any errors encountered during the request
		log('error', route, 'Failed to fetch roles', {
			error: (error as Error).message,
		})

		// Return a 500 Internal Server Error response in case of failure
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
