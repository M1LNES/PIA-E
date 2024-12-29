import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { changeRole } from '../../service/user-service'
import { AppError } from '../../utils/errors'

const route = 'PATCH /api/users/role'

/**
 * API route handler for changing the user's role.
 *
 * @param request - The incoming HTTP request object.
 * @returns The response with status and message indicating the result of the role change.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
	try {
		// Parse the request body to extract userId and roleId
		const body = await request.json()
		const { userId, roleId } = body

		await changeRole(userId, roleId)
		// Log the successful role change and return a success response
		log('info', route, `User with ID ${userId} has new role - ${roleId}`)
		return NextResponse.json(
			{
				message: 'Role successfully changed!',
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
