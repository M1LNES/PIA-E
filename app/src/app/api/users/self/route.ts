import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { getSelfInfo } from '../../service/user-service'
import { AppError } from '../../utils/errors'

const route = 'POST /api/users/self'

/**
 * API route handler for fetching user data by email.
 *
 * This function retrieves the information of a user specified by their email address.
 * The logged-in user is only allowed to fetch their own information.
 *
 * @returns A JSON response containing the user information, or an error message
 *          if the email is not specified, the user is unauthorized, or there's an internal error.
 */
export async function POST(request: Request) {
	try {
		// Parse the request body to extract the email
		const body = await request.json()
		const { email } = body

		const user = await getSelfInfo(email)
		log('info', route, `Returned info about user ${email}`)

		// Return the user data in the response
		return NextResponse.json({ user }, { status: 200 })
	} catch (error) {
		if (error instanceof AppError) {
			log('warn', route, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}
		// Log and return an internal server error if fetching the user fails
		log('error', route, 'Failed to fetch user', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}