import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import config from '@/app/config'
import { getHashedPasswordByEmail, updateUserPassword } from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'PATCH /api/users/password'

/**
 * API route handler for changing the user's password.
 *
 * @param request - The incoming HTTP request object.
 * @returns The response with status and message indicating the result of the password change.
 */
export async function PATCH(request: Request) {
	// Get the session of the current user
	const session = await getServerSession()

	// Check if the session exists. If not, return unauthorized response.
	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Parse the request body to extract the necessary fields
	const body = await request.json()
	const { email, oldPassword, newPassword, newPasswordConfirm } = body

	/* Authorization: Ensure the request is coming from the logged-in user */
	if (email !== session?.user?.email) {
		log(
			'warn',
			route,
			`User ${session.user?.email} tried to access other user's (${email}) data!`
		)
		return NextResponse.json(
			{
				error: 'Not enough permissions!',
			},
			{ status: 403 }
		)
	}

	try {
		// Fetch the hashed password of the user from the database
		const hashedPassword = await getHashedPasswordByEmail(email)

		// If no user is found, log the event and return an error response
		if (!hashedPassword) {
			log(
				'warn',
				route,
				`User ${session.user?.email} was not found in DB! Most likely they are deactivated.`
			)
			return NextResponse.json(
				{
					error: 'Not enough permissions!',
				},
				{ status: 403 }
			)
		}

		// Compare the provided old password with the stored hashed password
		const isPreviousPasswordSame = await bcrypt.compare(
			oldPassword,
			hashedPassword
		)

		// If the old password does not match, log the event and return an error response
		if (!isPreviousPasswordSame) {
			log(
				'info',
				route,
				`User ${session.user?.email} provided wrong old password.`
			)
			return NextResponse.json(
				{
					error: 'You provided the wrong old password!',
				},
				{ status: 400 }
			)
		}

		// Check if the new password and confirmation password match
		if (newPasswordConfirm !== newPassword) {
			log(
				'info',
				route,
				`${session.user?.email}'s password confirmation does not match.`
			)
			return NextResponse.json(
				{
					error: 'New password and confirm password are not the same!',
				},
				{ status: 400 }
			)
		}

		// Ensure that the new password is not the same as the old password
		if (oldPassword === newPassword) {
			log(
				'info',
				route,
				`${session.user?.email}'s new and old passwords were same.`
			)
			return NextResponse.json(
				{
					error: 'New password is the same as the old password!',
				},
				{ status: 400 }
			)
		}

		// Hash the new password and update it in the database
		const newHashedPassword = await bcrypt.hash(newPassword, config.saltRounds)
		await updateUserPassword(email, newHashedPassword)

		// Log the successful password change and return a success message
		log(
			'info',
			route,
			`${session.user?.email} successfully changed their password.`
		)
		return NextResponse.json(
			{
				message: 'Password successfully changed!',
			},
			{ status: 200 }
		)
	} catch (error) {
		// In case of any error, log the details and return a server error response
		log('error', route, 'Failed to change password', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
