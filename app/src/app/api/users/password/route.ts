import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { AppError } from '../../utils/errors'
import { changePassword } from '../../service/user-service'

const route = 'PATCH /api/users/password'

/**
 * API route handler for changing the user's password.
 *
 * @param request - The incoming HTTP request object.
 * @returns The response with status and message indicating the result of the password change.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
	try {
		// Parse the request body to extract the necessary fields
		const body = await request.json()
		const { emailAddress, oldPassword, newPassword, newPasswordConfirm } = body

		await changePassword(
			emailAddress,
			oldPassword,
			newPassword,
			newPasswordConfirm
		)
		// Log the successful password change and return a success message
		log('info', route, `User ${emailAddress} successfully changed password.`)
		return NextResponse.json(
			{
				message: 'Password successfully changed!',
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
