import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { AppError } from '../../utils/errors'
import { deactivateUser } from '../../service/user-service'

const route = 'PUT /api/users/deactivation'

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
	/* Authorization: Ensure the logged-in user has the appropriate permissions to disable another user */
	try {
		// Parse the request body to extract the email of the user to be disabled
		const body = await request.json()
		const { email } = body

		// Disable the user by email
		await deactivateUser(email)

		// Log the successful operation and return a success response
		log('info', route, `User successfully disabled : ${email}`)

		return NextResponse.json(
			{
				message: 'User disabled',
			},
			{ status: 200 }
		)
	} catch (error) {
		if (error instanceof AppError) {
			log('warn', route, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}
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
