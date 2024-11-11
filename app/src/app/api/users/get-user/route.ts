import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/app/api/queries'
import { getServerSession } from 'next-auth'
import { log } from '@/app/api/logger'

const route = 'POST /api/users/get-user'

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
	// Get the session of the current user
	const session = await getServerSession()

	// If no session is found, return an unauthorized response
	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Parse the request body to extract the email
	const body = await request.json()
	const { email } = body

	// If no email is provided, return a bad request response
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

	// Ensure that the logged-in user is only accessing their own information
	if (email !== session?.user?.email) {
		log(
			'warn',
			route,
			`User ${session.user?.email} tried to access other user's (${email}) data!`
		)
		return NextResponse.json(
			{
				error: 'Unauthorized to get user info',
			},
			{ status: 403 }
		)
	}

	try {
		// Fetch user information from the database by email
		const user = await getUserByEmail(email)
		log('info', route, `Returned info about user ${session.user?.email}`)

		// Return the user data in the response
		return NextResponse.json({ user }, { status: 200 })
	} catch (error) {
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
