import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getAllUsersWithRoles, getUserWithPermissions } from '../../queries'
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/users/get-all-users'

/**
 * API route handler for fetching all users with their roles.
 *
 * This function is responsible for ensuring that only authorized users with sufficient
 * permissions can access the list of all users. The logged-in user must have at least
 * the minimum required permissions to manage users.
 *
 * @returns A JSON response containing the list of users with roles, or an error message
 *          if the user is unauthorized, lacks permissions, or if there's an internal error.
 */
export async function GET() {
	// Get the session of the current user
	const session = await getServerSession()

	// If no session is found, return an unauthorized response
	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	try {
		// Fetch the logged-in user's permissions
		const user = await getUserWithPermissions(session.user?.email as string)

		// Check if the logged-in user has sufficient permissions to manage users
		if (user?.permission < config.pages.manageUsers.minPermission) {
			log(
				'warn',
				route,
				`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`,
				user
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		// Fetch all users with their roles
		const users = await getAllUsersWithRoles()

		// Log and return the list of users
		log('info', route, `Returned all users for user ${session.user?.email}`, {
			users,
		})
		return NextResponse.json({ users }, { status: 200 })
	} catch (error) {
		// Log any errors and return a server error response
		log('error', route, 'Failed to fetch users', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
