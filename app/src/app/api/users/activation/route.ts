import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserByEmail,
	getDeletedUserByEmail,
	activateUserByEmail,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'PUT /api/users/activation'

/**
 * API Route: PUT /api/users/activation
 *
 * This route allows an authenticated user with the necessary permissions to reactivate a user
 * by their email address. The function first checks if the requester is authenticated,
 * validates the provided email, checks user permissions, and reactivates the user if allowed.
 *
 * @returns {NextResponse} - A response indicating the success or failure of the operation.
 */
export async function PUT(request: Request) {
	/* Authentication */
	// Retrieve the session information to verify if the user is authenticated
	const session = await getServerSession()
	if (!session) {
		// Log the unauthorized access attempt and return a 401 Unauthorized response
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Parse the request body to retrieve the email
	const body = await request.json()
	const { email } = body

	// Check if the email is provided; return a 400 Bad Request response if not
	if (!email) {
		log('info', route, `User ${session.user?.email} did not specify email`)
		return NextResponse.json(
			{
				error: 'Email not specified!',
			},
			{ status: 400 }
		)
	}

	try {
		/* Authorization */
		// Fetch the user and check if the target user (email) is deleted
		const [user, deletedUser] = await Promise.all([
			getUserByEmail(session.user?.email as string), // Fetch the requesting user's data
			getDeletedUserByEmail(email), // Fetch the target user data if they are deleted
		])

		// Check if the user has the necessary permissions or if the target user has higher permissions
		if (
			user.permission < config.pages.manageUsers.minPermission || // Check if the user has the required permission
			(deletedUser && deletedUser.permission >= user.permission) // Check if the deleted user has higher permissions
		) {
			log(
				'warn',
				route,
				`User ${session.user?.email} does not have enough permissions.`
			)
			// Return a 403 Forbidden response if the user does not have sufficient permissions
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		// Reactivate the user with the provided email
		await activateUserByEmail(email)
		log('info', route, `User ${session.user?.email} re-activated user ${email}`)

		// Return a success message in the response
		return NextResponse.json(
			{
				message: 'User activated',
			},
			{ status: 200 }
		)
	} catch (error) {
		// Log any errors encountered during the process
		log('error', route, 'Failed to activate user', {
			error: (error as Error).message,
		})

		// Return a 500 Internal Server Error response if any error occurs
		return NextResponse.json(
			{
				error: 'Internal server error',
			},
			{ status: 500 }
		)
	}
}
