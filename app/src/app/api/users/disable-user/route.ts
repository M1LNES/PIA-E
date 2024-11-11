import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserWithPermissions,
	getDeletedUserByEmail,
	disableUserByEmail,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'PUT /api/users/disabled-user'

/**
 * API route handler for disabling a user by email.
 *
 * This function checks the permissions of the currently authenticated user
 * and disables the specified user if the current user has sufficient privileges.
 *
 * @param request - The incoming HTTP request object.
 * @returns The response with a status and message indicating whether the user was disabled successfully or if there was an error.
 */
export async function PUT(request: Request) {
	// Get the session of the current user
	const session = await getServerSession()

	// If the session is not found, return an unauthorized response
	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Parse the request body to extract the email of the user to be disabled
	const body = await request.json()
	const { email } = body

	// Validate the email field is provided in the request
	if (!email) {
		log(
			'warn',
			route,
			`User ${session.user?.email} tried to access endpoint without specifying e-mail address.`
		)
		return NextResponse.json(
			{
				error: 'Email not specified!',
			},
			{ status: 400 }
		)
	}

	/* Authorization: Ensure the logged-in user has the appropriate permissions to disable another user */
	try {
		// Fetch the logged-in user's permissions and check if they are allowed to disable users
		const user = await getUserWithPermissions(session.user?.email as string)
		const deletedUser = await getDeletedUserByEmail(email)

		// Check if the logged-in user has enough permissions or if the target user is not allowed to be disabled
		if (
			!user ||
			user.permission < config.pages.manageUsers.minPermission || // User does not have permission to manage users
			(deletedUser && deletedUser.permission >= user.permission) // Cannot disable users with equal or higher permissions
		) {
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

		// Disable the user by email
		await disableUserByEmail(email)

		// Log the successful operation and return a success response
		log(
			'info',
			route,
			`User ${session.user?.email} successfully disabled ${email}`
		)
		return NextResponse.json(
			{
				message: 'User disabled',
				status: 200,
			},
			{ status: 200 }
		)
	} catch (error) {
		// Log any errors that occur during the process and return a server error response
		log('error', route, 'Failed to disable user', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
