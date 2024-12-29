import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { activateUser } from '../../service/user-service'
import { AppError } from '../../utils/errors'

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
	// Parse the request body to retrieve the email
	try {
		const body = await request.json()
		const { emailAddress } = body

		await activateUser(emailAddress)
		log('info', route, `User re-activated: ${emailAddress}`)

		// Return a success message in the response
		return NextResponse.json(
			{
				message: 'User activated',
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
