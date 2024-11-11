import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserByEmail,
	getUserDetailsById,
	getRolePermission,
	updateUserRole,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = '/api/users/change-role'

/**
 * API route handler for changing the user's role.
 *
 * @param request - The incoming HTTP request object.
 * @returns The response with status and message indicating the result of the role change.
 */
export async function POST(request: Request) {
	// Get the session of the current user
	const session = await getServerSession()

	// Check if the session exists. If not, return unauthorized response.
	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Parse the request body to extract userId and roleId
	const body = await request.json()
	const { userId, roleId } = body

	// Validate the required fields (userId and roleId) are present
	if (!userId || !roleId) {
		log(
			'warn',
			route,
			`User ${session.user?.email} provided invalid values:`,
			body
		)
		return NextResponse.json(
			{
				error: 'Required values are invalid',
			},
			{ status: 422 }
		)
	}

	/* Authorization: Ensure the logged-in user has the appropriate permissions to change the role */
	try {
		// Fetch the current user, the user to be updated, and the permissions associated with the new role
		const [dbUser, updatedUser, rolePerm] = await Promise.all([
			getUserByEmail(session.user?.email as string),
			getUserDetailsById(userId),
			getRolePermission(roleId),
		])

		// If any of the fetched data is missing, log the event and return an error response
		if (!dbUser || !updatedUser || rolePerm === undefined) {
			log('warn', route, `User or role not found...`, {
				dbUser,
				updatedUser,
				rolePerm,
			})
			return NextResponse.json(
				{
					error: 'User or role not found',
				},
				{ status: 404 }
			)
		}

		// Check if the current user has sufficient permissions to change the role
		if (
			dbUser.permission < config.pages.manageUsers.minPermission || // User does not have permission to manage users
			updatedUser.permission >= dbUser.permission || // Cannot demote or change role of users with higher or equal permissions
			dbUser.permission <= rolePerm // User cannot assign a role with equal or higher permission
		) {
			log(
				'warn',
				route,
				`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		// Update the user's role in the database
		await updateUserRole(userId, roleId)

		// Log the successful role change and return a success response
		log(
			'info',
			route,
			`User ${session.user?.email} changed role of ${updatedUser.email}`
		)
		return NextResponse.json(
			{
				message: 'Role successfully changed!',
				status: 200,
			},
			{ status: 200 }
		)
	} catch (error) {
		// Log the error details and return a server error response in case of failure
		log('error', route, 'Failed to change user role', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
